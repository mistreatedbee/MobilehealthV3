import React, { useState } from 'react';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

interface DaySchedule {
  day: string;
  enabled: boolean;
  slots: TimeSlot[];
}

interface WorkingHours {
  start: string;
  end: string;
}

export function Availability() {
  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    start: '09:00',
    end: '17:00'
  });

  const [schedule, setSchedule] = useState<DaySchedule[]>([
    { day: 'Monday', enabled: true, slots: [{ id: '1', startTime: '09:00', endTime: '17:00' }] },
    { day: 'Tuesday', enabled: true, slots: [{ id: '1', startTime: '09:00', endTime: '17:00' }] },
    { day: 'Wednesday', enabled: true, slots: [{ id: '1', startTime: '09:00', endTime: '17:00' }] },
    { day: 'Thursday', enabled: true, slots: [{ id: '1', startTime: '09:00', endTime: '17:00' }] },
    { day: 'Friday', enabled: true, slots: [{ id: '1', startTime: '09:00', endTime: '17:00' }] },
    { day: 'Saturday', enabled: false, slots: [{ id: '1', startTime: '10:00', endTime: '14:00' }] },
    { day: 'Sunday', enabled: false, slots: [{ id: '1', startTime: '10:00', endTime: '14:00' }] }
  ]);

  const [breaks, setBreaks] = useState([
    { id: '1', day: 'Monday', startTime: '12:00', endTime: '13:00', description: 'Lunch Break' }
  ]);

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [customDateSlots, setCustomDateSlots] = useState<{date: string; slots: TimeSlot[]}[]>([]);

  const toggleDay = (dayIndex: number) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[dayIndex].enabled = !updatedSchedule[dayIndex].enabled;
    setSchedule(updatedSchedule);
  };

  const addTimeSlot = (dayIndex: number) => {
    const updatedSchedule = [...schedule];
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      startTime: '09:00',
      endTime: '10:00'
    };
    updatedSchedule[dayIndex].slots.push(newSlot);
    setSchedule(updatedSchedule);
  };

  const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
    const updatedSchedule = [...schedule];
    if (updatedSchedule[dayIndex].slots.length > 1) {
      updatedSchedule[dayIndex].slots.splice(slotIndex, 1);
      setSchedule(updatedSchedule);
    }
  };

  const updateTimeSlot = (dayIndex: number, slotIndex: number, field: 'startTime' | 'endTime', value: string) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[dayIndex].slots[slotIndex][field] = value;
    setSchedule(updatedSchedule);
  };

  const applyToAllWeekdays = () => {
    const updatedSchedule = schedule.map(day => {
      if (['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day.day)) {
        return {
          ...day,
          enabled: true,
          slots: [{ id: '1', startTime: workingHours.start, endTime: workingHours.end }]
        };
      }
      return day;
    });
    setSchedule(updatedSchedule);
  };

  const addCustomDate = () => {
    if (selectedDate) {
      const newCustomDate = {
        date: selectedDate,
        slots: [{ id: Date.now().toString(), startTime: '09:00', endTime: '17:00' }]
      };
      setCustomDateSlots([...customDateSlots, newCustomDate]);
      setSelectedDate('');
    }
  };

  const saveAvailability = () => {
    // In a real app, this would send data to an API
    console.log('Saving availability:', { schedule, breaks, customDateSlots });
    alert('Availability saved successfully!');
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Set Your Availability</h1>
          <p className="text-gray-600">Manage your working hours and schedule</p>
        </div>
        <button
          onClick={saveAvailability}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
        >
          Save Changes
        </button>
      </div>

      {/* Quick Setup */}
      <div className="bg-white p-6 rounded-lg shadow-md border mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Setup</h2>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Standard Working Hours (Weekdays)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={workingHours.start}
                onChange={(e) => setWorkingHours({ ...workingHours, start: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-gray-500">to</span>
              <input
                type="time"
                value={workingHours.end}
                onChange={(e) => setWorkingHours({ ...workingHours, end: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={applyToAllWeekdays}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm"
              >
                Apply to All Weekdays
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="bg-white p-6 rounded-lg shadow-md border mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Weekly Schedule</h2>
        <div className="space-y-4">
          {schedule.map((day, dayIndex) => (
            <div key={day.day} className="flex flex-col md:flex-row md:items-center gap-4 p-4 border rounded-lg">
              <div className="flex items-center md:w-32">
                <input
                  type="checkbox"
                  checked={day.enabled}
                  onChange={() => toggleDay(dayIndex)}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  {day.day}
                </label>
              </div>
              
              <div className="flex-1">
                {day.enabled ? (
                  <div className="space-y-2">
                    {day.slots.map((slot, slotIndex) => (
                      <div key={slot.id} className="flex items-center gap-2">
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => updateTimeSlot(dayIndex, slotIndex, 'startTime', e.target.value)}
                          className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <span className="text-gray-500 text-sm">to</span>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => updateTimeSlot(dayIndex, slotIndex, 'endTime', e.target.value)}
                          className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {day.slots.length > 1 && (
                          <button
                            onClick={() => removeTimeSlot(dayIndex, slotIndex)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addTimeSlot(dayIndex)}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add another time slot
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">Unavailable</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Dates */}
      <div className="bg-white p-6 rounded-lg shadow-md border mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Custom Date Availability</h2>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={addCustomDate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Add Custom Date
          </button>
        </div>
        
        {customDateSlots.length > 0 && (
          <div className="space-y-3">
            {customDateSlots.map((customDate, index) => (
              <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                <span className="font-medium text-gray-700 min-w-32">
                  {new Date(customDate.date).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={customDate.slots[0].startTime}
                    className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    value={customDate.slots[0].endTime}
                    className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
                  />
                </div>
                <button
                  onClick={() => setCustomDateSlots(customDateSlots.filter((_, i) => i !== index))}
                  className="text-red-600 hover:text-red-800 text-sm ml-auto"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Preview */}
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Schedule Preview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {schedule.filter(day => day.enabled).map(day => (
            <div key={day.day} className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">{day.day}</h3>
              <div className="space-y-1">
                {day.slots.map(slot => (
                  <div key={slot.id} className="text-sm text-gray-600">
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {customDateSlots.length > 0 && (
          <>
            <h3 className="font-semibold text-gray-800 mt-6 mb-3">Custom Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {customDateSlots.map((customDate, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">
                    {new Date(customDate.date).toLocaleDateString()}
                  </h4>
                  <div className="text-sm text-gray-600">
                    {formatTime(customDate.slots[0].startTime)} - {formatTime(customDate.slots[0].endTime)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}