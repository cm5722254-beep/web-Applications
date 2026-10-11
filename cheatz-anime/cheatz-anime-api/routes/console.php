<?php

use Illuminate\Support\Facades\Schedule;

// Expire subscriptions that have passed their end date
Schedule::command('subscriptions:expire')->daily();

// Update cached view/favorite counts
Schedule::command('anime:update-counts')->hourly();
