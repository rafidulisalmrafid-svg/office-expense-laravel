<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmployeeApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;
    public string $temporaryPassword;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user, string $temporaryPassword)
    {
        $this->user = $user;
        $this->temporaryPassword = $temporaryPassword;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address('rafidul.labar.bd@gmail.com', 'NexGen Office Expense & Fund System'),
            subject: 'আপনার অফিস অ্যাকাউন্ট অনুমোদিত হয়েছে - NexGen Expense System',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.employee_approved',
            with: [
                'user' => $this->user,
                'temporaryPassword' => $this->temporaryPassword,
                'loginUrl' => url('/login'),
                'fromEmail' => 'rafidul.labar.bd@gmail.com',
            ],
        );
    }
}
