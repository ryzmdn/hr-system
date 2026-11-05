<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\OffboardingStatus;
use App\Enums\OffboardingType;
use App\Models\Employee;
use App\Models\ExitClearanceItem;
use App\Models\ExperienceLetter;
use App\Models\OffboardingRequest;
use App\Services\OffboardingService;
use App\Services\SeveranceCalculationService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OffboardingController extends Controller
{
    public function __construct(
        protected OffboardingService $offboardingService,
        protected SeveranceCalculationService $severanceService,
    ) {}

    public function index(): Response
    {
        $requests = OffboardingRequest::query()
            ->with(['employee.branch', 'employee.department', 'clearanceItems', 'severance', 'experienceLetter'])
            ->latest()
            ->get();

        $employees = Employee::query()
            ->where('status', 'ACTIVE')
            ->orderBy('name')
            ->get(['id', 'nik', 'name', 'join_date']);

        return Inertia::render('offboarding/index', [
            'requests' => $requests,
            'employees' => $employees,
            'types' => array_map(fn (OffboardingType $t) => [
                'value' => $t->value,
                'label' => $t->label(),
                'up_multiplier' => $t->upMultiplier(),
                'upmk_multiplier' => $t->upmkMultiplier(),
            ], OffboardingType::cases()),
            'statuses' => array_map(fn (OffboardingStatus $s) => [
                'value' => $s->value,
                'label' => $s->label(),
            ], OffboardingStatus::cases()),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'employee_id' => ['required', 'exists:employees,id'],
            'type' => ['required', 'string'],
            'notice_date' => ['required', 'date'],
            'effective_date' => ['required', 'date', 'after_or_equal:notice_date'],
            'reason' => ['required', 'string', 'max:1000'],
            'uph_amount' => ['nullable', 'numeric', 'min:0'],
        ]);

        $employee = Employee::findOrFail($validated['employee_id']);
        $type = OffboardingType::from($validated['type']);

        $this->offboardingService->initiateOffboarding(
            $employee,
            $type,
            $validated['notice_date'],
            $validated['effective_date'],
            $validated['reason'],
            (float) ($validated['uph_amount'] ?? 0)
        );

        return redirect()->back()->with('success', 'Proses offboarding dan kalkulasi pesangon PP 35/2021 berhasil diinisiasi.');
    }

    public function show(OffboardingRequest $offboarding): Response
    {
        $offboarding->load([
            'employee.branch',
            'employee.department',
            'employee.position',
            'clearanceItems.clearedBy',
            'severance',
            'experienceLetter',
            'approvedBy',
        ]);

        return Inertia::render('offboarding/show', [
            'offboarding' => $offboarding,
        ]);
    }

    public function clearItem(ExitClearanceItem $item, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $this->offboardingService->clearItem(
            $item,
            $request->user(),
            $validated['notes'] ?? null
        );

        return redirect()->back()->with('success', 'Item checklist exit clearance berhasil disetujui.');
    }

    public function finalize(OffboardingRequest $offboarding, Request $request): RedirectResponse
    {
        $this->offboardingService->finalizeOffboarding($offboarding, $request->user());

        return redirect()->back()->with('success', 'Offboarding resmi diselesaikan. Status karyawan telah diperbarui dan surat paklaring resmi diterbitkan.');
    }

    public function showLetter(string $token): Response
    {
        $letter = ExperienceLetter::query()
            ->where('verification_token', $token)
            ->with(['employee.branch', 'employee.department', 'employee.position', 'offboardingRequest'])
            ->firstOrFail();

        return Inertia::render('offboarding/letter', [
            'letter' => $letter,
        ]);
    }
}

