import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    Pressable,
    ScrollView,
} from 'react-native';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Clock } from 'lucide-react-native';

interface DatePickerModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectDate: (dateStr: string) => void;
    initialDate?: string;
    minDate?: string;
    title?: string;
}

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getLocalDateString(d: Date = new Date()): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function parseDate(str?: string): Date {
    if (str && /^\d{4}-\d{2}-\d{2}$/.test(str)) {
        const [y, m, d] = str.split('-').map(Number);
        return new Date(y, m - 1, d);
    }
    return new Date();
}

function formatReadableDate(str: string): string {
    if (!str || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    const [y, m, d] = str.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export function DatePickerModal({
    visible,
    onClose,
    onSelectDate,
    initialDate,
    minDate,
    title = 'Select Date',
}: DatePickerModalProps) {
    const todayStr = getLocalDateString(new Date());
    const effectiveMinDate = minDate || todayStr;

    const initial = parseDate(initialDate || todayStr);
    const [viewYear, setViewYear] = useState<number>(initial.getFullYear());
    const [viewMonth, setViewMonth] = useState<number>(initial.getMonth());
    const [selectedDateStr, setSelectedDateStr] = useState<string>(initialDate || todayStr);

    useEffect(() => {
        if (visible) {
            const dateToUse = initialDate || todayStr;
            const d = parseDate(dateToUse);
            setViewYear(d.getFullYear());
            setViewMonth(d.getMonth());
            setSelectedDateStr(dateToUse);
        }
    }, [visible, initialDate]);

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const handlePrevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(viewYear - 1);
        } else {
            setViewMonth(viewMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(viewYear + 1);
        } else {
            setViewMonth(viewMonth + 1);
        }
    };

    const handleQuickSelect = (daysFromToday: number) => {
        const target = new Date();
        target.setDate(target.getDate() + daysFromToday);
        const targetStr = getLocalDateString(target);
        if (targetStr >= effectiveMinDate) {
            setSelectedDateStr(targetStr);
            setViewYear(target.getFullYear());
            setViewMonth(target.getMonth());
        }
    };

    const handleConfirm = () => {
        onSelectDate(selectedDateStr);
        onClose();
    };

    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDayIndex = getFirstDayOfMonth(viewYear, viewMonth);

    const daysArray: (number | null)[] = [];
    for (let i = 0; i < firstDayIndex; i++) {
        daysArray.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
        daysArray.push(d);
    }

    const formatDateStr = (year: number, month: number, day: number) => {
        const m = String(month + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        return `${year}-${m}-${d}`;
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/60 justify-end">
                <View className="bg-white rounded-t-[32px] overflow-hidden max-h-[90%]">
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24 }}>

                        {/* TOP BAR */}
                        <View className="flex-row items-center justify-between pb-3 border-b border-gray-100">
                            <View className="flex-row items-center gap-3">
                                <View className="bg-blue-600 p-2.5 rounded-2xl shadow-sm">
                                    <CalendarIcon size={22} color="#FFFFFF" />
                                </View>
                                <View>
                                    <Text className="text-xl font-bold text-gray-900">
                                        {title}
                                    </Text>
                                    <Text className="text-xs text-blue-600 font-semibold mt-0.5">
                                        {formatReadableDate(selectedDateStr)}
                                    </Text>
                                </View>
                            </View>
                            <Pressable onPress={onClose} className="p-2 bg-gray-100 rounded-full active:bg-gray-200">
                                <X size={20} color="#374151" />
                            </Pressable>
                        </View>

                        {/* QUICK PRESETS */}
                        <View className="flex-row gap-2 my-4">
                            {[
                                { label: 'Today', offset: 0 },
                                { label: 'Tomorrow', offset: 1 },
                                { label: 'In 2 Days', offset: 2 },
                                { label: 'In 1 Week', offset: 7 },
                            ].map((preset) => {
                                const target = new Date();
                                target.setDate(target.getDate() + preset.offset);
                                const targetStr = getLocalDateString(target);
                                const isDisabled = targetStr < effectiveMinDate;
                                const isSelected = selectedDateStr === targetStr;

                                return (
                                    <Pressable
                                        key={preset.label}
                                        disabled={isDisabled}
                                        onPress={() => handleQuickSelect(preset.offset)}
                                        className={`px-3.5 py-2 rounded-xl flex-row items-center gap-1 ${
                                            isSelected
                                                ? 'bg-blue-600'
                                                : isDisabled
                                                ? 'bg-gray-100 opacity-40'
                                                : 'bg-blue-50 border border-blue-100'
                                        }`}
                                    >
                                        <Clock size={12} color={isSelected ? '#FFFFFF' : '#2563EB'} />
                                        <Text className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-blue-700'}`}>
                                            {preset.label}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        {/* MONTH / YEAR NAVIGATION */}
                        <View className="flex-row items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl p-2.5 mb-4">
                            <Pressable
                                onPress={handlePrevMonth}
                                className="p-2 bg-white rounded-xl border border-gray-100 active:bg-gray-100 shadow-2xs"
                            >
                                <ChevronLeft size={20} color="#1F2937" />
                            </Pressable>

                            <Text className="text-base font-bold text-gray-900">
                                {MONTH_NAMES[viewMonth]} {viewYear}
                            </Text>

                            <Pressable
                                onPress={handleNextMonth}
                                className="p-2 bg-white rounded-xl border border-gray-100 active:bg-gray-100 shadow-2xs"
                            >
                                <ChevronRight size={20} color="#1F2937" />
                            </Pressable>
                        </View>

                        {/* DAYS OF WEEK */}
                        <View className="flex-row justify-between mb-2 px-1">
                            {DAYS_OF_WEEK.map((day, idx) => (
                                <View key={idx} className="w-[14%] items-center">
                                    <Text className="text-xs font-bold text-gray-400 uppercase">
                                        {day}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        {/* DAYS GRID */}
                        <View className="flex-row flex-wrap justify-start mb-6">
                            {daysArray.map((day, idx) => {
                                if (day === null) {
                                    return <View key={`blank-${idx}`} className="w-[14.28%] h-11" />;
                                }

                                const dateStr = formatDateStr(viewYear, viewMonth, day);
                                const isDisabled = dateStr < effectiveMinDate;
                                const isSelected = dateStr === selectedDateStr;
                                const isToday = dateStr === todayStr;

                                return (
                                    <View key={`day-${day}`} className="w-[14.28%] h-11 items-center justify-center my-0.5">
                                        <Pressable
                                            disabled={isDisabled}
                                            onPress={() => setSelectedDateStr(dateStr)}
                                            className={`w-10 h-10 items-center justify-center rounded-full ${
                                                isSelected
                                                    ? 'bg-blue-600 shadow-md shadow-blue-500/30'
                                                    : isToday
                                                    ? 'border-2 border-blue-600 bg-blue-50'
                                                    : isDisabled
                                                    ? 'opacity-25'
                                                    : 'active:bg-blue-50'
                                            }`}
                                        >
                                            <Text
                                                className={`text-sm ${
                                                    isSelected
                                                        ? 'text-white font-bold'
                                                        : isToday
                                                        ? 'text-blue-700 font-bold'
                                                        : isDisabled
                                                        ? 'text-gray-400 line-through'
                                                        : 'text-gray-800 font-medium'
                                                }`}
                                            >
                                                {day}
                                            </Text>
                                        </Pressable>
                                    </View>
                                );
                            })}
                        </View>

                        {/* SELECTED SUMMARY & CONFIRM BUTTON */}
                        <View className="bg-blue-50 border border-blue-100 p-3.5 rounded-2xl mb-4 flex-row items-center justify-between">
                            <View>
                                <Text className="text-xs text-blue-600 font-semibold uppercase">Selected Date</Text>
                                <Text className="text-sm font-bold text-gray-900">{formatReadableDate(selectedDateStr)}</Text>
                            </View>
                            <Text className="text-xs text-blue-700 font-bold bg-blue-100 px-2.5 py-1 rounded-full">
                                {selectedDateStr}
                            </Text>
                        </View>

                        <Pressable
                            onPress={handleConfirm}
                            className="bg-blue-600 py-4 rounded-2xl items-center active:bg-blue-700 shadow-md shadow-blue-600/20 mb-2"
                        >
                            <Text className="text-white font-bold text-base">
                                Select This Date
                            </Text>
                        </Pressable>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}
