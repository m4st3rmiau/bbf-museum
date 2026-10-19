<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function (): void {
            DB::table('artwork_submissions')
                ->orderBy('id')
                ->chunkById(100, function (Collection $submissions): void {
                    foreach ($submissions as $submission) {
                        DB::table('artwork_submissions')
                            ->where('id', $submission->id)
                            ->update([
                                'contact_name' => Crypt::decryptString($submission->contact_name),
                                'email' => Crypt::decryptString($submission->email),
                                'phone' => Crypt::decryptString($submission->phone),
                            ]);
                    }
                });
        });
    }

    public function down(): void
    {
        DB::transaction(function (): void {
            DB::table('artwork_submissions')
                ->orderBy('id')
                ->chunkById(100, function (Collection $submissions): void {
                    foreach ($submissions as $submission) {
                        DB::table('artwork_submissions')
                            ->where('id', $submission->id)
                            ->update([
                                'contact_name' => Crypt::encryptString($submission->contact_name),
                                'email' => Crypt::encryptString($submission->email),
                                'phone' => Crypt::encryptString($submission->phone),
                            ]);
                    }
                });
        });
    }
};
