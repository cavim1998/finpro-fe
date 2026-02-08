"use client";

type Props = {
  title?: string;
  greetingName: string;
  loadingProfile: boolean;
};

export default function AttendanceHeader({
  title = "Worker Attendance",
  greetingName,
  loadingProfile,
}: Props) {
  return (
    <div className="space-y-1 pl-4">
      <h1 className="text-4xl font-semibold ">{title}</h1>
      <p className="text-2xl text-gray-600">
        {loadingProfile ? "Memuat profil..." : `Halo, ${greetingName}! 👋`}
      </p>
    </div>
  );
}