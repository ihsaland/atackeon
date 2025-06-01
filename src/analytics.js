// Analytics event tracking for Medieval Math Battles

export const trackEvent = (eventName, eventParams = {}) => {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventParams);
    }
};

// Game progression events
export const trackLevelStart = (level, enemyName) => {
    trackEvent('level_start', {
        level: level,
        enemy_name: enemyName
    });
};

export const trackLevelComplete = (level, enemyName, timeSpent) => {
    trackEvent('level_complete', {
        level: level,
        enemy_name: enemyName,
        time_spent: timeSpent
    });
};

// Problem solving events
export const trackProblemAttempt = (level, problemType, isCorrect, timeSpent) => {
    trackEvent('problem_attempt', {
        level: level,
        problem_type: problemType,
        is_correct: isCorrect,
        time_spent: timeSpent
    });
};

// Game completion events
export const trackGameComplete = (totalTime, levelsCompleted) => {
    trackEvent('game_complete', {
        total_time: totalTime,
        levels_completed: levelsCompleted
    });
};

// Error tracking
export const trackError = (errorType, errorMessage) => {
    trackEvent('game_error', {
        error_type: errorType,
        error_message: errorMessage
    });
}; 