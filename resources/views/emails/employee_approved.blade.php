<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>অ্যাকাউন্ট অনুমোদন ও লগইন ক্রেডেনশিয়াল</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f1f5f9;
            margin: 0;
            padding: 20px;
            color: #1e293b;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
        }
        .header {
            background: linear-gradient(135deg, #4338ca, #6366f1);
            color: #ffffff;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 22px;
            font-weight: 700;
        }
        .header p {
            margin: 6px 0 0;
            font-size: 13px;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .greeting {
            font-size: 16px;
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 12px;
        }
        .message {
            font-size: 14px;
            line-height: 1.6;
            color: #334155;
            margin-bottom: 24px;
        }
        .credentials-box {
            background: #f8fafc;
            border: 2px dashed #cbd5e1;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 24px;
        }
        .credential-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
            font-size: 14px;
        }
        .credential-item:last-child {
            border-bottom: none;
        }
        .credential-label {
            color: #64748b;
            font-weight: 500;
        }
        .credential-value {
            font-weight: 700;
            color: #0f172a;
            font-family: monospace;
            font-size: 15px;
        }
        .password-highlight {
            color: #4338ca;
            background: #e0e7ff;
            padding: 4px 10px;
            border-radius: 6px;
        }
        .btn-wrapper {
            text-align: center;
            margin: 30px 0;
        }
        .btn {
            display: inline-block;
            background: #4338ca;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 10px;
            font-weight: 700;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(67, 56, 202, 0.3);
        }
        .security-note {
            font-size: 12px;
            color: #64748b;
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        .footer {
            background: #f8fafc;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>NexGen Innovations Ltd.</h1>
            <p>Office Expense & Fund Management System</p>
        </div>

        <div class="content">
            <div class="greeting">
                প্রিয় {{ $user->name }},
            </div>

            <div class="message">
                অভিনন্দন! অফিস ফান্ড ও ব্যয় ব্যবস্থাপনা সিস্টেমে আপনার কর্মচারী অ্যাকাউন্টটি অ্যাডমিন কর্তৃক সফলভাবে <strong>অনুমোদন (Approved)</strong> করা হয়েছে। আপনি এখন থেকে ফান্ডের জন্য আবেদন, দৈনিক খরচের রসিদ এন্ট্রি এবং ব্যালেন্স পরিচালনা করতে পারবেন।
            </div>

            <div class="credentials-box">
                <div class="credential-item">
                    <span class="credential-label">কর্মচারী আইডি (Employee ID):</span>
                    <span class="credential-value">{{ $user->employee_id ?? 'EMP-' . $user->id }}</span>
                </div>
                <div class="credential-item">
                    <span class="credential-label">লগইন ইমেইল (Login Email):</span>
                    <span class="credential-value">{{ $user->email }}</span>
                </div>
                <div class="credential-item">
                    <span class="credential-label">সাময়িক পাসওয়ার্ড (Password):</span>
                    <span class="credential-value password-highlight">{{ $temporaryPassword }}</span>
                </div>
            </div>

            <div class="security-note">
                <strong>নিরাপত্তা সতর্কতা:</strong> অনুগ্রহ করে প্রথমবার সফলভাবে লগইন করার পর নিজের সুবিধাজনক নতুন পাসওয়ার্ড সেট করে নিন। এই পাসওয়ার্ডটি কাউকে শেয়ার করবেন না।
            </div>

            <div class="btn-wrapper">
                <a href="{{ $loginUrl }}" class="btn">এখনই অ্যাকাউন্টে লগইন করুন</a>
            </div>

            <p style="font-size: 13px; color: #64748b; text-align: center;">
                যদি উপরের বাটনে ক্লিক করতে সমস্যা হয়, ব্রাউজারে এই লিংকটি ওপেন করুন: <br>
                <a href="{{ $loginUrl }}" style="color: #4338ca;">{{ $loginUrl }}</a>
            </p>
        </div>

        <div class="footer">
            <p style="margin: 0 0 6px;">এই স্বয়ংক্রিয় ইমেইলটি <strong>{{ $fromEmail }}</strong> থেকে পাঠানো হয়েছে।</p>
            <p style="margin: 0;">© 2026 NexGen Innovations Ltd. সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
    </div>
</body>
</html>
