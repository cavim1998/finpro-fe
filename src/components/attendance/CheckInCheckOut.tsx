import React, { useState } from "react";

export default function CheckInCheckOut() {
  const [checkIn, setCheckIn] = useState(false);

  return (
    <div>
      {!checkIn ? (
        <div className="m-2">
          <button
            onClick={() => setCheckIn(true)}
            className="w-full p-4 hover:bg-[#0f6a4f] hover:text-white rounded-2xl bg-[#148160] text-white font-bold"
          >
            Check-In
          </button>
        </div>
      ) : (
        <div className="m-2">
          <button
            onClick={() => setCheckIn(false)}
            className="w-full p-4 hover:bg-[#e57d7b] hover:text-black rounded-2xl bg-[#E53935] font-bold text-white"
          >
            Check-Out
          </button>
        </div>
      )}
    </div>
  );
}
