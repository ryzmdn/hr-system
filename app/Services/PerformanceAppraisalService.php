<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\AppraisalStatus;
use App\Enums\PerformanceRatingGrade;
use App\Models\Employee;
use App\Models\PerformanceAppraisal;
use App\Models\PerformanceAppraisalItem;
use App\Models\PerformancePeriod;
use Illuminate\Support\Facades\DB;

class PerformanceAppraisalService
{
    public function createAppraisal(
        PerformancePeriod $period,
        Employee $employee,
        ?Employee $evaluator,
        array $kpiItems,
        ?string $feedback = null,
    ): PerformanceAppraisal {
        return DB::transaction(function () use ($period, $employee, $evaluator, $kpiItems, $feedback): PerformanceAppraisal {
            $appraisal = PerformanceAppraisal::create([
                'performance_period_id' => $period->id,
                'employee_id' => $employee->id,
                'evaluator_id' => $evaluator?->id,
                'overall_score' => 0.0,
                'rating_grade' => PerformanceRatingGrade::B,
                'feedback' => $feedback,
                'status' => AppraisalStatus::Draft,
            ]);

            $totalWeightedScore = 0.0;

            foreach ($kpiItems as $item) {
                $targetVal = max(0.001, (float) $item['target_value']);
                $actualVal = (float) ($item['actual_value'] ?? 0);
                $weight = (float) $item['weight_percentage'];

                $score = min(120.0, round(($actualVal / $targetVal) * 100, 2));
                $weightedScore = round($score * ($weight / 100), 2);
                $totalWeightedScore += $weightedScore;

                PerformanceAppraisalItem::create([
                    'performance_appraisal_id' => $appraisal->id,
                    'kpi_name' => $item['kpi_name'],
                    'target_description' => $item['target_description'] ?? null,
                    'weight_percentage' => $weight,
                    'target_value' => $targetVal,
                    'actual_value' => $actualVal,
                    'score' => $score,
                    'weighted_score' => $weightedScore,
                ]);
            }

            $overallScore = round($totalWeightedScore, 2);
            $grade = PerformanceRatingGrade::fromScore($overallScore);

            $appraisal->update([
                'overall_score' => $overallScore,
                'rating_grade' => $grade,
            ]);

            return $appraisal->fresh(['items', 'employee', 'evaluator', 'period']);
        });
    }

    public function evaluateAppraisal(
        PerformanceAppraisal $appraisal,
        array $updatedItemActuals,
        ?string $feedback,
        AppraisalStatus $status = AppraisalStatus::Finalized,
    ): PerformanceAppraisal {
        return DB::transaction(function () use ($appraisal, $updatedItemActuals, $feedback, $status): PerformanceAppraisal {
            $totalWeightedScore = 0.0;

            foreach ($appraisal->items as $item) {
                $actualVal = isset($updatedItemActuals[$item->id])
                    ? (float) $updatedItemActuals[$item->id]
                    : (float) $item->actual_value;

                $targetVal = max(0.001, (float) $item->target_value);
                $score = min(120.0, round(($actualVal / $targetVal) * 100, 2));
                $weightedScore = round($score * ((float) $item->weight_percentage / 100), 2);
                $totalWeightedScore += $weightedScore;

                $item->update([
                    'actual_value' => $actualVal,
                    'score' => $score,
                    'weighted_score' => $weightedScore,
                ]);
            }

            $overallScore = round($totalWeightedScore, 2);
            $grade = PerformanceRatingGrade::fromScore($overallScore);

            $appraisal->update([
                'overall_score' => $overallScore,
                'rating_grade' => $grade,
                'feedback' => $feedback ?? $appraisal->feedback,
                'status' => $status,
            ]);

            return $appraisal->fresh(['items', 'employee', 'evaluator']);
        });
    }
}

