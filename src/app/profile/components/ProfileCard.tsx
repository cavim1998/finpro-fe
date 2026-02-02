import React from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';

interface ProfileData {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    joinDate?: string;
    profileImage?: string;
}

interface ProfileCardProps {
    data: ProfileData;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ data }) => {
    return (
        <div className="w-full bg-linear-to-br from-[#f0fefb] to-[#ffffff] rounded-lg shadow-lg overflow-hidden">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Profile Image Section */}
                    <div className="flex flex-col items-center md:col-span-1">
                        <div className="relative">
                            <div className="w-48 h-48 rounded-full bg-[#1dacbc] flex items-center justify-center shadow-lg overflow-hidden border-4 border-white">
                                {data.profileImage ? (
                                    <img
                                        src={data.profileImage}
                                        alt={data.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <FaUser className="text-white text-6xl" />
                                )}
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-[#1dacbc] mt-6 text-center">
                            {data.name}
                        </h2>
                        <p className="text-gray-500 text-center mt-2">LaundryQ Member</p>
                    </div>

                    {/* Profile Details Section */}
                    <div className="md:col-span-2">
                        <h3 className="text-2xl font-bold text-[#1dacbc] mb-6">Profile Information</h3>

                        <div className="space-y-4">
                            {/* Email */}
                            <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-[#1dacbc] transition">
                                <div className="shrink-0">
                                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-[#e8faf7]">
                                        <FaEnvelope className="text-[#1dacbc] text-lg" />
                                    </div>
                                </div>
                                <div className="grow">
                                    <p className="text-sm font-medium text-gray-500">Email</p>
                                    <p className="text-lg font-semibold text-gray-800">{data.email}</p>
                                </div>
                            </div>

                            {/* Phone */}
                            {data.phone && (
                                <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-[#1dacbc] transition">
                                    <div className="shrink-0">
                                        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-[#e8faf7]">
                                            <FaPhone className="text-[#1dacbc] text-lg" />
                                        </div>
                                    </div>
                                    <div className="grow">
                                        <p className="text-sm font-medium text-gray-500">Phone Number</p>
                                        <p className="text-lg font-semibold text-gray-800">{data.phone}</p>
                                    </div>
                                </div>
                            )}

                            {/* Address */}
                            {data.address && (
                                <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-[#1dacbc] transition">
                                    <div className="shrink-0">
                                        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-[#e8faf7]">
                                            <FaMapMarkerAlt className="text-[#1dacbc] text-lg" />
                                        </div>
                                    </div>
                                    <div className="grow">
                                        <p className="text-sm font-medium text-gray-500">Address</p>
                                        <p className="text-lg font-semibold text-gray-800">{data.address}</p>
                                    </div>
                                </div>
                            )}

                            {/* Join Date */}
                            {data.joinDate && (
                                <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-[#1dacbc] transition">
                                    <div className="shrink-0">
                                        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-[#e8faf7]">
                                            <FaCalendarAlt className="text-[#1dacbc] text-lg" />
                                        </div>
                                    </div>
                                    <div className="grow">
                                        <p className="text-sm font-medium text-gray-500">Member Since</p>
                                        <p className="text-lg font-semibold text-gray-800">{data.joinDate}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 mt-8">
                            <button className="flex-1 bg-[#1dacbc] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#14939e] transition">
                                Edit Profile
                            </button>
                            <button className="flex-1 bg-white border-2 border-[#1dacbc] text-[#1dacbc] py-3 px-4 rounded-lg font-semibold hover:bg-[#f0fefb] transition">
                                Change Password
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileCard;
