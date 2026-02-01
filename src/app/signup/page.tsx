import React from 'react'

const page = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                <h1 className="text-3xl text-black font-semibold text-center mb-8">
                    Create Account
                </h1>

                <form className="space-y-5">
                    {/* Name */}
                    <div>
                        <input
                            type="text"
                            placeholder="Name"
                            className="w-full border text-black border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#14939e]"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full border text-black border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#14939e]"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full border text-black border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#14939e]"
                        />
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        className="w-full bg-[#1dacbc] text-white py-3 rounded-full font-medium hover:bg-[#14939e] transition"
                    >
                        Create Account
                    </button>
                </form>

                {/* Login link */}
                <p className="text-center text-sm text-gray-500 mt-4">
                    Already have an account?{" "}
                    <a href="/sign-in" className="text-[#1dacbc] hover:underline">
                        Sign In
                    </a>
                </p>

                {/* Divider */}
                <div className="flex items-center my-6 gap-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400">or</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Google */}
                <button className="w-full border border-gray-300 rounded-full py-3 flex items-center justify-center gap-3 hover:bg-gray-50 transition">
                    <img
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        alt="Google"
                        className="w-5 h-5"
                    />
                    <span className="font-medium text-black">Sign up with Google</span>
                </button>
            </div>
        </div>
    )
}

export default page