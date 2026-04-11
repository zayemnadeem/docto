import React from 'react';

export default function SlotPicker({ slots, selectedSlot, onSelectSlot }) {
  // Group slots by date
  const grouped = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

  const dates = Object.keys(grouped).sort();

  if (slots.length === 0) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 text-center">
        No availability slots for the selected period.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {dates.map((date) => (
        <div key={date} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h4 className="font-semibold text-gray-700 mb-3">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric'})}</h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {grouped[date].map((slot) => {
              const isSelected = selectedSlot?.id === slot.id;
              return (
                <button
                  key={slot.id}
                  disabled={slot.is_booked}
                  onClick={() => onSelectSlot(slot)}
                  className={`
                    px-3 py-2 text-sm font-medium rounded-lg transition-all
                    ${slot.is_booked 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed line-through' 
                      : isSelected 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-600 ring-offset-2' 
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'}
                  `}
                >
                  {slot.start_time.slice(0, 5)}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
