<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Unauthenticated visitors visiting / are redirected to /login.
     */
    public function test_guest_is_redirected_to_login_from_root(): void
    {
        $response = $this->get('/');
        $response->assertRedirect(route('login'));
    }

    /**
     * Unauthenticated visitors accessing /dashboard are redirected to /login.
     */
    public function test_guest_is_redirected_to_login_from_dashboard(): void
    {
        $response = $this->get('/dashboard');
        $response->assertRedirect(route('login'));
    }

    /**
     * Login page is accessible to guests.
     */
    public function test_login_page_renders_successfully(): void
    {
        $response = $this->get('/login');
        $response->assertStatus(200);
    }

    /**
     * Existing user can authenticate and access dashboard.
     */
    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::where('email', 'admin@company.com')->first();
        if (!$user) {
            $user = User::factory()->create([
                'email' => 'admin@company.com',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'status' => 'approved',
            ]);
        }

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password123',
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticatedAs($user);
    }

    /**
     * New user can register, requires admin approval, and can log in once approved.
     */
    public function test_new_user_can_register_and_authenticate(): void
    {
        $uniqueEmail = 'newemp_' . time() . '@company.com';

        $registerResponse = $this->post('/register', [
            'name' => 'তানভীর হাসান',
            'email' => $uniqueEmail,
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'department' => 'Operations',
            'designation' => 'Executive',
            'role' => 'employee',
        ]);

        $registerResponse->assertRedirect(route('login'));

        // Registration creates account in pending status
        $this->assertDatabaseHas('users', [
            'email' => $uniqueEmail,
            'status' => 'pending',
            'role' => 'employee',
        ]);

        // Attempt login while pending: must be blocked
        $blockedLoginResponse = $this->post('/login', [
            'email' => $uniqueEmail,
            'password' => 'password123',
        ]);
        $blockedLoginResponse->assertSessionHas('error');
        $this->assertGuest();

        // Admin approves the user
        $admin = User::factory()->create([
            'role' => 'admin',
            'status' => 'approved',
        ]);
        $newUser = User::where('email', $uniqueEmail)->first();
        $approveResponse = $this->actingAs($admin)->post("/users/{$newUser->id}/approve");
        $approveResponse->assertSessionHas('success');

        $newUser->refresh();
        $this->assertEquals('approved', $newUser->status);

        // Attempt login with newly approved credentials: must succeed
        $this->post('/logout');
        $loginResponse = $this->post('/login', [
            'email' => $uniqueEmail,
            'password' => 'password123',
        ]);

        $loginResponse->assertRedirect('/dashboard');
        $this->assertAuthenticatedAs($newUser);
    }

    /**
     * Authenticated user can log out.
     */
    public function test_user_can_logout(): void
    {
        $user = User::factory()->create([
            'email' => 'logout_test@company.com',
            'status' => 'approved',
            'role' => 'employee',
        ]);

        $response = $this->actingAs($user)->post('/logout');

        $response->assertRedirect(route('login'));
        $this->assertGuest();
    }
}
