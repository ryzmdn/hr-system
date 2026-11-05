<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\AssetCondition;
use App\Enums\AssetStatus;
use App\Models\Employee;
use App\Models\EmployeeAsset;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeAssetController extends Controller
{
    public function index(): Response
    {
        $assets = EmployeeAsset::query()
            ->with(['employee.branch', 'employee.department'])
            ->latest('handover_date')
            ->get();

        $employees = Employee::query()
            ->where('status', 'ACTIVE')
            ->orderBy('name')
            ->get(['id', 'nik', 'name']);

        return Inertia::render('assets/index', [
            'assets' => $assets,
            'employees' => $employees,
            'conditions' => array_map(fn (AssetCondition $c) => [
                'value' => $c->value,
                'label' => $c->label(),
            ], AssetCondition::cases()),
            'statuses' => array_map(fn (AssetStatus $s) => [
                'value' => $s->value,
                'label' => $s->label(),
            ], AssetStatus::cases()),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'employee_id' => ['required', 'exists:employees,id'],
            'asset_tag' => ['required', 'string', 'max:50', 'unique:employee_assets,asset_tag'],
            'name' => ['required', 'string', 'max:150'],
            'category' => ['required', 'string', 'max:100'],
            'serial_number' => ['nullable', 'string', 'max:100'],
            'handover_date' => ['required', 'date'],
            'handover_condition' => ['required', 'string'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $bastNumber = 'BAST/' . Carbon::now()->format('Ym') . '/' . strtoupper(Str::random(5));

        EmployeeAsset::create([
            'employee_id' => $validated['employee_id'],
            'asset_tag' => strtoupper($validated['asset_tag']),
            'name' => $validated['name'],
            'category' => $validated['category'],
            'serial_number' => $validated['serial_number'] ?? null,
            'handover_date' => $validated['handover_date'],
            'handover_condition' => AssetCondition::from($validated['handover_condition']),
            'bast_number' => $bastNumber,
            'status' => AssetStatus::Assigned,
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Aset berhasil diserahterimakan dan BAST diterbitkan.');
    }

    public function returnAsset(EmployeeAsset $asset, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'returned_date' => ['required', 'date'],
            'return_condition' => ['required', 'string'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $condition = AssetCondition::from($validated['return_condition']);
        $newStatus = match ($condition) {
            AssetCondition::Damaged => AssetStatus::Damaged,
            default => AssetStatus::Returned,
        };

        $asset->update([
            'returned_date' => $validated['returned_date'],
            'return_condition' => $condition,
            'status' => $newStatus,
            'notes' => $validated['notes'] ?? $asset->notes,
        ]);

        return redirect()->back()->with('success', 'Pengembalian aset berhasil dicatat.');
    }
}

