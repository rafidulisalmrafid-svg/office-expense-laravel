<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AuthController extends Controller
{
    /**
     * Show the Login & Registration Portal.
     */
    public function showLogin()
    {
        if (Auth::check()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Auth/Login', [
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
            'from_email' => 'rafidul.labar.bd@gmail.com',
        ]);
    }

    /**
     * Handle user login authentication.
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ], [
            'email.required' => 'ইমেইল প্রদান করা আবশ্যক।',
            'email.email' => 'সঠিক ইমেইল ফরম্যাট প্রদান করুন।',
            'password.required' => 'পাসওয়ার্ড প্রদান করা আবশ্যক।',
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if ($user) {
            if ($user->status === 'pending') {
                return redirect()->back()->with('error', 'আপনার অ্যাকাউন্টটি এখনো অ্যাডমিন অনুমোদনের অপেক্ষায় রয়েছে। অ্যাডমিন অনুমোদন প্রদান করার পরই কেবল লগইন করা সম্ভব। অনুমোদন পেলে আপনার ইমেইলে (rafidul.labar.bd@gmail.com থেকে) পাসওয়ার্ড ও নিশ্চিতকরণ পাঠানো হবে।');
            }

            if ($user->status === 'rejected') {
                return redirect()->back()->with('error', 'আপনার অ্যাকাউন্ট আবেদনটি অ্যাডমিন কর্তৃক বাতিল করা হয়েছে। বিস্তারিত জানার জন্য অফিসে যোগাযোগ করুন।');
            }
        }

        if (Auth::attempt(['email' => $credentials['email'], 'password' => $credentials['password']], $request->boolean('remember'))) {
            $request->session()->regenerate();
            $authUser = Auth::user();

            AuditLog::create([
                'transaction_id' => 'LOG-' . date('Ymd') . '-' . strtoupper(Str::random(4)),
                'user_id' => $authUser->id,
                'action_type' => 'user_login',
                'remarks' => "{$authUser->name} ({$authUser->role}) সফলভাবে লগইন করেছেন",
                'actor_name' => $authUser->name,
            ]);

            return redirect()->intended('/dashboard')->with('success', "স্বাগতম, {$authUser->name}!");
        }

        return redirect()->back()->with('error', 'প্রদত্ত ইমেইল বা পাসওয়ার্ড সঠিক নয়। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    }

    /**
     * Handle user self-registration with password.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'phone' => 'nullable|string|max:50',
            'department' => 'required|string|max:100',
            'designation' => 'required|string|max:100',
            'role' => 'nullable|string|in:employee,admin,accounts_manager',
        ], [
            'name.required' => 'আপনার পুরো নাম আবশ্যক।',
            'email.required' => 'ইমেইল অ্যাড্রেস আবশ্যক।',
            'email.unique' => 'এই ইমেইলটি দিয়ে ইতোমধ্যে অ্যাকাউন্ট খোলা হয়েছে।',
            'password.required' => 'পাসওয়ার্ড প্রদান করা আবশ্যক।',
            'password.min' => 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।',
            'password.confirmed' => 'পাসওয়ার্ড নিশ্চিতকরণ মিলছে না।',
            'department.required' => 'বিভাগ নির্বাচন করুন।',
            'designation.required' => 'পদবি প্রদান করুন।',
        ]);

        $role = $validated['role'] ?? 'employee';
        $prefix = $role === 'admin' ? 'ADM-' : ($role === 'accounts_manager' ? 'ACC-' : 'EMP-');
        $nextId = $prefix . (User::count() + 101);

        $user = User::create([
            'employee_id' => $nextId,
            'name' => trim($validated['name']),
            'email' => trim($validated['email']),
            'phone' => $validated['phone'] ?? null,
            'department' => trim($validated['department']),
            'designation' => trim($validated['designation']),
            'role' => $role,
            'status' => 'pending', // Strictly pending until Admin approves!
            'password' => Hash::make($validated['password']),
        ]);

        AuditLog::create([
            'transaction_id' => 'REG-' . date('Ymd') . '-' . strtoupper(Str::random(4)),
            'user_id' => $user->id,
            'action_type' => 'user_registered',
            'remarks' => "নতুন কর্মচারী অ্যাকাউন্ট রেজিস্ট্রেশন করেছে (অনুমোদনের অপেক্ষায়): {$user->name} ({$user->employee_id})",
            'actor_name' => $user->name,
        ]);

        return redirect()->route('login')->with('success', 'রেজিস্ট্রেশন আবেদন সফলভাবে গৃহীত হয়েছে! আপনার অ্যাকাউন্টটি বর্তমানে অ্যাডমিনের অনুমোদনের অপেক্ষায় রয়েছে। অ্যাডমিন অনুমোদন দিলে আপনার ইমেইলে কনফার্মেশন ও লগইন পাসওয়ার্ড চলে যাবে।');
    }

    /**
     * Handle user logout.
     */
    public function logout(Request $request)
    {
        $user = Auth::user();
        if ($user) {
            AuditLog::create([
                'transaction_id' => 'LOUT-' . date('Ymd') . '-' . strtoupper(Str::random(4)),
                'user_id' => $user->id,
                'action_type' => 'user_logout',
                'remarks' => "{$user->name} লগআউট করেছেন",
                'actor_name' => $user->name,
            ]);
        }

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->with('success', 'আপনি সফলভাবে লগআউট হয়েছেন।');
    }

    /**
     * 1-Click Instant Demo Login for hassle-free testing.
     */
    public function demoLogin(Request $request, string $role)
    {
        $user = null;
        if ($role === 'admin') {
            $user = User::where('role', 'admin')->first();
        } elseif ($role === 'accounts') {
            $user = User::where('role', 'accounts_manager')->first();
        } else {
            $user = User::where('role', 'employee')->where('status', 'approved')->first();
        }

        if ($user) {
            Auth::login($user);
            $request->session()->regenerate();
            return redirect()->route('dashboard')->with('success', "ডেমো লগইন সফল হয়েছে: {$user->name} ({$user->role})");
        }

        return redirect()->route('login')->with('error', 'ডেমো ইউজার পাওয়া যায়নি।');
    }
}
