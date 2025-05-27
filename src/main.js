import * as BABYLON from '@babylonjs/core';
import { Howl } from 'howler';

// Level configuration
const LEVEL_CONFIG = {
    maxLevel: 15,
    enemies: [
        { name: "Novice Scholar", color: new BABYLON.Color3(0.8, 0.8, 0.8) },
        { name: "Apprentice Mage", color: new BABYLON.Color3(0.7, 0.8, 0.9) },
        { name: "Battle Scholar", color: new BABYLON.Color3(0.6, 0.7, 0.8) },
        { name: "Arcane Knight", color: new BABYLON.Color3(0.5, 0.6, 0.7) },
        { name: "Mystic Warrior", color: new BABYLON.Color3(0.4, 0.5, 0.6) },
        { name: "Ancient Sage", color: new BABYLON.Color3(0.3, 0.4, 0.5) },
        { name: "Dragon Scholar", color: new BABYLON.Color3(0.2, 0.3, 0.4) },
        { name: "Celestial Mage", color: new BABYLON.Color3(0.1, 0.2, 0.3) },
        { name: "Void Knight", color: new BABYLON.Color3(0.0, 0.1, 0.2) },
        { name: "Elder Guardian", color: new BABYLON.Color3(0.9, 0.1, 0.1) },
        { name: "Time Weaver", color: new BABYLON.Color3(0.8, 0.2, 0.2) },
        { name: "Space Bender", color: new BABYLON.Color3(0.7, 0.3, 0.3) },
        { name: "Reality Shaper", color: new BABYLON.Color3(0.6, 0.4, 0.4) },
        { name: "Cosmic Lord", color: new BABYLON.Color3(0.5, 0.5, 0.5) },
        { name: "Sir Eon", color: new BABYLON.Color3(1, 0, 0) }
    ]
};

// Game state
let gameState = {
    playerHealth: 100,
    playerLevel: 1,
    enemyHealth: 100,
    enemyLevel: 1,
    currentProblem: null,
    score: 0,
    isAnimating: false,
    timeRemaining: 0,
    timerInterval: null,
    currentEnemy: null,
    usedQuestions: new Set(),
    continueTimeRemaining: 10,
    continueTimerInterval: null
};

// Timer configuration
const TIMER_CONFIG = {
    baseTime: 60, // Base time in seconds
    levelMultiplier: 0.8, // Time decreases by 20% per level
    minTime: 15, // Minimum time allowed
    warningThreshold: 10 // Time in seconds when warning appears
};

// Sound generator class
class SoundGenerator {
    static createLevelUpSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Configure sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
        oscillator.frequency.linearRampToValueAtTime(880, audioContext.currentTime + 0.5); // A5
        
        // Configure volume envelope
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
        
        // Play sound
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
        
        return audioContext;
    }
    
    static createBossAppearSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        // Connect nodes
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Configure filter
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, audioContext.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 1);
        
        // Configure sound
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // A3
        oscillator.frequency.exponentialRampToValueAtTime(55, audioContext.currentTime + 1); // A1
        
        // Configure volume envelope
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);
        
        // Play sound
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 1);
        
        return audioContext;
    }

    static createPlayerHitSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        // Connect nodes
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Configure filter
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2000, audioContext.currentTime);
        filter.Q.setValueAtTime(5, audioContext.currentTime);
        
        // Configure sound
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
        oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.2); // A4
        
        // Configure volume envelope
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);
        
        // Play sound
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
        
        return audioContext;
    }
    
    static createEnemyHitSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        // Connect nodes
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Configure filter
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, audioContext.currentTime);
        filter.Q.setValueAtTime(2, audioContext.currentTime);
        
        // Configure sound
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
        oscillator.frequency.exponentialRampToValueAtTime(220, audioContext.currentTime + 0.3); // A3
        
        // Configure volume envelope
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
        
        // Play sound
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
        
        return audioContext;
    }

    static createVictorySound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillators = [];
        const gainNode = audioContext.createGain();
        
        // Create a chord progression
        const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
        const durations = [0.2, 0.2, 0.2, 0.4];
        
        notes.forEach((frequency, index) => {
            const oscillator = audioContext.createOscillator();
            const noteGain = audioContext.createGain();
            
            oscillator.connect(noteGain);
            noteGain.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            
            noteGain.gain.setValueAtTime(0, audioContext.currentTime);
            noteGain.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.05);
            noteGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + durations[index]);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + durations[index]);
            oscillators.push(oscillator);
        });
        
        return audioContext;
    }
    
    static createDefeatSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, audioContext.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 1);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(110, audioContext.currentTime + 1);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 1);
        
        return audioContext;
    }
}

// Modify the sounds object to use generated sounds
const sounds = {
    background: new Howl({
        src: ['assets/sounds/medieval-background.mp3'],
        loop: true,
        volume: 0.5
    }),
    attack: new Howl({
        src: ['assets/sounds/sword-attack.mp3']
    }),
    damage: new Howl({
        src: ['assets/sounds/damage.mp3']
    }),
    victory: {
        play: () => SoundGenerator.createVictorySound()
    },
    defeat: {
        play: () => SoundGenerator.createDefeatSound()
    },
    levelUp: {
        play: () => SoundGenerator.createLevelUpSound()
    },
    bossAppear: {
        play: () => SoundGenerator.createBossAppearSound()
    },
    playerHit: {
        play: () => SoundGenerator.createPlayerHitSound()
    },
    enemyHit: {
        play: () => SoundGenerator.createEnemyHitSound()
    }
};

// Problem generator with enhanced difficulty
class ProblemGenerator {
    static generateProblem(level) {
        const problemTypes = [
            this.generateAlgebraProblem,
            this.generateGeometryProblem,
            this.generateLogicProblem,
            this.generateCalculusProblem,
            this.generateProbabilityProblem
        ];
        
        const availableTypes = problemTypes.slice(0, Math.min(3 + Math.floor(level / 3), problemTypes.length));
        let selectedType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        
        // Try to generate a unique problem
        let problem;
        let attempts = 0;
        const maxAttempts = 10;
        
        do {
            problem = selectedType(level);
            attempts++;
            
            // If we've tried too many times, clear the used questions and try again
            if (attempts >= maxAttempts) {
                gameState.usedQuestions.clear();
                problem = selectedType(level);
                break;
            }
        } while (gameState.usedQuestions.has(problem.question));
        
        // Add the new problem to used questions
        gameState.usedQuestions.add(problem.question);
        return problem;
    }

    static generateAlgebraProblem(level) {
        const complexity = Math.min(level, 5);
        const a = Math.floor(Math.random() * (10 * complexity)) + 1;
        const b = Math.floor(Math.random() * (10 * complexity)) + 1;
        const c = Math.floor(Math.random() * (5 * complexity)) + 1;
        
        const problems = [
            {
                question: `Solve for x: ${a}x + ${b} = ${c}`,
                answer: ((c - b) / a).toString()
            },
            {
                question: `What is ${a}² + ${b}²?`,
                answer: (a * a + b * b).toString()
            }
        ];
        
        return problems[Math.floor(Math.random() * problems.length)];
    }

    static generateGeometryProblem(level) {
        const complexity = Math.min(level, 5);
        const a = Math.floor(Math.random() * (10 * complexity)) + 1;
        const b = Math.floor(Math.random() * (10 * complexity)) + 1;
        
        const problems = [
            {
                question: `Find the area of a rectangle with length ${a} and width ${b}`,
                answer: (a * b).toString()
            },
            {
                question: `Find the hypotenuse of a right triangle with sides ${a} and ${b}`,
                answer: Math.sqrt(a * a + b * b).toFixed(2)
            }
        ];
        
        return problems[Math.floor(Math.random() * problems.length)];
    }

    static generateLogicProblem(level) {
        const complexity = Math.min(level, 5);
        const problems = [
            {
                question: `If all A are B, and all B are C, then all A are C. True or False?`,
                answer: "true"
            },
            {
                question: `What comes next: 2, 4, 8, 16, ...?`,
                answer: "32"
            }
        ];
        
        return problems[Math.floor(Math.random() * problems.length)];
    }

    static generateCalculusProblem(level) {
        const complexity = Math.min(level, 5);
        const a = Math.floor(Math.random() * (10 * complexity)) + 1;
        const b = Math.floor(Math.random() * (5 * complexity)) + 1;
        
        const problems = [
            {
                question: `Find the derivative of f(x) = ${a}x² + ${b}x`,
                answer: `${2 * a}x + ${b}`
            },
            {
                question: `What is the integral of ${a}x + ${b}?`,
                answer: `${a/2}x² + ${b}x + C`
            }
        ];
        
        return problems[Math.floor(Math.random() * problems.length)];
    }

    static generateProbabilityProblem(level) {
        const complexity = Math.min(level, 5);
        const a = Math.floor(Math.random() * (10 * complexity)) + 1;
        const b = Math.floor(Math.random() * (10 * complexity)) + 1;
        
        const problems = [
            {
                question: `What is the probability of rolling a sum of ${a} with two dice?`,
                answer: this.calculateDiceProbability(a)
            },
            {
                question: `In a bag of ${a} red and ${b} blue marbles, what is the probability of drawing a red marble?`,
                answer: (a / (a + b)).toFixed(2)
            }
        ];
        
        return problems[Math.floor(Math.random() * problems.length)];
    }

    static calculateDiceProbability(sum) {
        if (sum < 2 || sum > 12) return "0";
        const combinations = {
            2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6,
            8: 5, 9: 4, 10: 3, 11: 2, 12: 1
        };
        return (combinations[sum] / 36).toFixed(2);
    }
}

// Animation sequences
class AnimationManager {
    static async playAttackAnimation(attacker, target, scene) {
        const originalPosition = attacker.position.clone();
        const targetPosition = target.position.clone();
        
        // Create attack animation sequence
        const attackAnimation = new BABYLON.Animation(
            "attackAnimation",
            "position",
            30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        // More dynamic attack movement
        const keyFrames = [
            {
                frame: 0,
                value: originalPosition
            },
            {
                frame: 10,
                value: new BABYLON.Vector3(
                    originalPosition.x + (targetPosition.x - originalPosition.x) * 0.3,
                    originalPosition.y + 0.5,
                    originalPosition.z
                )
            },
            {
                frame: 15,
                value: new BABYLON.Vector3(
                    targetPosition.x * 0.8,
                    targetPosition.y,
                    targetPosition.z * 0.8
                )
            },
            {
                frame: 20,
                value: new BABYLON.Vector3(
                    targetPosition.x * 0.9,
                    targetPosition.y,
                    targetPosition.z * 0.9
                )
            },
            {
                frame: 30,
                value: originalPosition
            }
        ];

        attackAnimation.setKeys(keyFrames);
        attacker.animations = [attackAnimation];

        // Add rotation animation for more dynamic attack
        const rotationAnimation = new BABYLON.Animation(
            "attackRotation",
            "rotation",
            30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const rotationKeyFrames = [
            {
                frame: 0,
                value: new BABYLON.Vector3(0, 0, 0)
            },
            {
                frame: 10,
                value: new BABYLON.Vector3(0, Math.PI / 4, 0)
            },
            {
                frame: 15,
                value: new BABYLON.Vector3(0, Math.PI / 2, 0)
            },
            {
                frame: 20,
                value: new BABYLON.Vector3(0, Math.PI * 3/4, 0)
            },
            {
                frame: 30,
                value: new BABYLON.Vector3(0, 0, 0)
            }
        ];

        rotationAnimation.setKeys(rotationKeyFrames);
        attacker.animations.push(rotationAnimation);
        
        return new Promise((resolve) => {
            scene.beginAnimation(attacker, 0, 30, false, 1, () => {
                resolve();
            });
        });
    }

    static async playDamageAnimation(target, scene) {
        const originalRotation = target.rotation.clone();
        const originalPosition = target.position.clone();
        
        // Create damage animation with more dramatic effect
        const damageAnimation = new BABYLON.Animation(
            "damageAnimation",
            "rotation",
            30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const keyFrames = [
            {
                frame: 0,
                value: originalRotation
            },
            {
                frame: 5,
                value: new BABYLON.Vector3(originalRotation.x + 0.3, originalRotation.y + 0.2, originalRotation.z)
            },
            {
                frame: 10,
                value: new BABYLON.Vector3(originalRotation.x - 0.3, originalRotation.y - 0.2, originalRotation.z)
            },
            {
                frame: 15,
                value: new BABYLON.Vector3(originalRotation.x + 0.2, originalRotation.y + 0.1, originalRotation.z)
            },
            {
                frame: 20,
                value: new BABYLON.Vector3(originalRotation.x - 0.2, originalRotation.y - 0.1, originalRotation.z)
            },
            {
                frame: 30,
                value: originalRotation
            }
        ];

        damageAnimation.setKeys(keyFrames);
        target.animations = [damageAnimation];

        // Add position animation for knockback effect
        const knockbackAnimation = new BABYLON.Animation(
            "knockbackAnimation",
            "position",
            30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const knockbackKeyFrames = [
            {
                frame: 0,
                value: originalPosition
            },
            {
                frame: 5,
                value: new BABYLON.Vector3(
                    originalPosition.x * 1.1,
                    originalPosition.y,
                    originalPosition.z
                )
            },
            {
                frame: 15,
                value: new BABYLON.Vector3(
                    originalPosition.x * 1.05,
                    originalPosition.y,
                    originalPosition.z
                )
            },
            {
                frame: 30,
                value: originalPosition
            }
        ];

        knockbackAnimation.setKeys(knockbackKeyFrames);
        target.animations.push(knockbackAnimation);
        
        return new Promise((resolve) => {
            scene.beginAnimation(target, 0, 30, false, 1, () => {
                resolve();
            });
        });
    }

    static async playVictoryAnimation(character, scene) {
        const originalPosition = character.position.clone();
        
        // Create victory animation
        const victoryAnimation = new BABYLON.Animation(
            "victoryAnimation",
            "position",
            60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const keyFrames = [
            {
                frame: 0,
                value: originalPosition
            },
            {
                frame: 15,
                value: new BABYLON.Vector3(originalPosition.x, originalPosition.y + 1, originalPosition.z)
            },
            {
                frame: 30,
                value: new BABYLON.Vector3(originalPosition.x, originalPosition.y + 1, originalPosition.z)
            },
            {
                frame: 45,
                value: new BABYLON.Vector3(originalPosition.x, originalPosition.y + 1, originalPosition.z)
            },
            {
                frame: 60,
                value: originalPosition
            }
        ];

        victoryAnimation.setKeys(keyFrames);
        character.animations = [victoryAnimation];
        
        return new Promise((resolve) => {
            scene.beginAnimation(character, 0, 60, false, 1, () => {
                resolve();
            });
        });
    }

    static async playLevelTransitionAnimation(scene, isBossLevel) {
        // Create a full-screen overlay
        const overlay = new BABYLON.MeshBuilder.CreatePlane(
            "levelTransitionOverlay",
            { width: 20, height: 20 },
            scene
        );
        overlay.position = new BABYLON.Vector3(0, 0, -0.1);
        
        const overlayMaterial = new BABYLON.StandardMaterial("overlayMaterial", scene);
        overlayMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        overlayMaterial.alpha = 0;
        overlay.material = overlayMaterial;
        
        // Play appropriate sound
        if (isBossLevel) {
            sounds.bossAppear.play();
        } else {
            sounds.levelUp.play();
        }
        
        // Fade in
        const fadeInAnimation = new BABYLON.Animation(
            "fadeIn",
            "material.alpha",
            30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        fadeInAnimation.setKeys([
            { frame: 0, value: 0 },
            { frame: 30, value: 1 }
        ]);
        
        overlay.animations = [fadeInAnimation];
        
        return new Promise((resolve) => {
            scene.beginAnimation(overlay, 0, 30, false, 1, () => {
                // Fade out
                const fadeOutAnimation = new BABYLON.Animation(
                    "fadeOut",
                    "material.alpha",
                    30,
                    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
                    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
                );
                
                fadeOutAnimation.setKeys([
                    { frame: 0, value: 1 },
                    { frame: 30, value: 0 }
                ]);
                
                overlay.animations = [fadeOutAnimation];
                
                scene.beginAnimation(overlay, 0, 30, false, 1, () => {
                    overlay.dispose();
                    resolve();
                });
            });
        });
    }

    static async playVictoryEffect(scene) {
        // Create victory particles
        const particleSystem = new BABYLON.ParticleSystem("victoryParticles", 2000, scene);
        particleSystem.particleTexture = new BABYLON.Texture("assets/textures/flare.png", scene);
        particleSystem.emitter = new BABYLON.Vector3(0, 0, 0);
        particleSystem.minEmitBox = new BABYLON.Vector3(-10, 0, -10);
        particleSystem.maxEmitBox = new BABYLON.Vector3(10, 0, 10);
        
        // Configure particles
        particleSystem.color1 = new BABYLON.Color4(1, 0.8, 0, 1.0);
        particleSystem.color2 = new BABYLON.Color4(1, 0.2, 0, 1.0);
        particleSystem.minSize = 0.1;
        particleSystem.maxSize = 0.5;
        particleSystem.minLifeTime = 0.5;
        particleSystem.maxLifeTime = 2;
        particleSystem.emitRate = 1000;
        particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);
        particleSystem.direction1 = new BABYLON.Vector3(-2, 8, -2);
        particleSystem.direction2 = new BABYLON.Vector3(2, 8, 2);
        particleSystem.minAngularSpeed = 0;
        particleSystem.maxAngularSpeed = Math.PI;
        particleSystem.minEmitPower = 1;
        particleSystem.maxEmitPower = 3;
        particleSystem.updateSpeed = 0.01;
        
        particleSystem.start();
        
        // Create victory text
        const victoryText = new BABYLON.MeshBuilder.CreatePlane("victoryText", { width: 5, height: 1 }, scene);
        const victoryMaterial = new BABYLON.StandardMaterial("victoryMaterial", scene);
        victoryMaterial.diffuseTexture = new BABYLON.Texture("assets/textures/victory.png", scene);
        victoryMaterial.emissiveColor = new BABYLON.Color3(1, 0.8, 0);
        victoryMaterial.alpha = 0;
        victoryText.material = victoryMaterial;
        victoryText.position = new BABYLON.Vector3(0, 2, 0);
        
        // Animate victory text
        const fadeInAnimation = new BABYLON.Animation(
            "fadeIn",
            "material.alpha",
            30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        fadeInAnimation.setKeys([
            { frame: 0, value: 0 },
            { frame: 30, value: 1 }
        ]);
        
        victoryText.animations = [fadeInAnimation];
        
        return new Promise((resolve) => {
            scene.beginAnimation(victoryText, 0, 30, false, 1, () => {
                setTimeout(() => {
                    particleSystem.stop();
                    particleSystem.dispose();
                    victoryText.dispose();
                    resolve();
                }, 2000);
            });
        });
    }
    
    static async playDefeatEffect(scene) {
        // Create defeat particles
        const particleSystem = new BABYLON.ParticleSystem("defeatParticles", 2000, scene);
        particleSystem.particleTexture = new BABYLON.Texture("assets/textures/flare.png", scene);
        particleSystem.emitter = new BABYLON.Vector3(0, 0, 0);
        particleSystem.minEmitBox = new BABYLON.Vector3(-10, 0, -10);
        particleSystem.maxEmitBox = new BABYLON.Vector3(10, 0, 10);
        
        // Configure particles
        particleSystem.color1 = new BABYLON.Color4(0.5, 0, 0, 1.0);
        particleSystem.color2 = new BABYLON.Color4(0.2, 0, 0, 1.0);
        particleSystem.minSize = 0.1;
        particleSystem.maxSize = 0.5;
        particleSystem.minLifeTime = 0.5;
        particleSystem.maxLifeTime = 2;
        particleSystem.emitRate = 1000;
        particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);
        particleSystem.direction1 = new BABYLON.Vector3(-2, 8, -2);
        particleSystem.direction2 = new BABYLON.Vector3(2, 8, 2);
        particleSystem.minAngularSpeed = 0;
        particleSystem.maxAngularSpeed = Math.PI;
        particleSystem.minEmitPower = 1;
        particleSystem.maxEmitPower = 3;
        particleSystem.updateSpeed = 0.01;
        
        particleSystem.start();
        
        // Create defeat text
        const defeatText = new BABYLON.MeshBuilder.CreatePlane("defeatText", { width: 5, height: 1 }, scene);
        const defeatMaterial = new BABYLON.StandardMaterial("defeatMaterial", scene);
        defeatMaterial.diffuseTexture = new BABYLON.Texture("assets/textures/defeat.png", scene);
        defeatMaterial.emissiveColor = new BABYLON.Color3(0.8, 0, 0);
        defeatMaterial.alpha = 0;
        defeatText.material = defeatMaterial;
        defeatText.position = new BABYLON.Vector3(0, 2, 0);
        
        // Animate defeat text
        const fadeInAnimation = new BABYLON.Animation(
            "fadeIn",
            "material.alpha",
            30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        fadeInAnimation.setKeys([
            { frame: 0, value: 0 },
            { frame: 30, value: 1 }
        ]);
        
        defeatText.animations = [fadeInAnimation];
        
        return new Promise((resolve) => {
            scene.beginAnimation(defeatText, 0, 30, false, 1, () => {
                setTimeout(() => {
                    particleSystem.stop();
                    particleSystem.dispose();
                    defeatText.dispose();
                    resolve();
                }, 2000);
            });
        });
    }
}

// Timer management
class TimerManager {
    static startTimer(level) {
        // Clear any existing timer
        if (gameState.timerInterval) {
            clearInterval(gameState.timerInterval);
        }

        // Calculate time based on level
        const timeForLevel = Math.max(
            TIMER_CONFIG.minTime,
            TIMER_CONFIG.baseTime * Math.pow(TIMER_CONFIG.levelMultiplier, level - 1)
        );
        
        gameState.timeRemaining = Math.floor(timeForLevel);
        this.updateTimerDisplay();

        // Start the countdown
        gameState.timerInterval = setInterval(() => {
            gameState.timeRemaining--;
            this.updateTimerDisplay();

            if (gameState.timeRemaining <= 0) {
                this.handleTimeUp();
            }
        }, 1000);
    }

    static updateTimerDisplay() {
        const timerElement = document.getElementById('timer');
        const timerBar = document.getElementById('timerBar');
        
        // Update timer text
        timerElement.textContent = `Time: ${gameState.timeRemaining}s`;
        
        // Update progress bar
        const timeForLevel = Math.max(
            TIMER_CONFIG.minTime,
            TIMER_CONFIG.baseTime * Math.pow(TIMER_CONFIG.levelMultiplier, gameState.enemyLevel - 1)
        );
        const percentage = (gameState.timeRemaining / timeForLevel) * 100;
        timerBar.style.width = `${percentage}%`;

        // Add warning class when time is low
        if (gameState.timeRemaining <= TIMER_CONFIG.warningThreshold) {
            timerElement.classList.add('warning');
            timerBar.classList.add('warning');
        } else {
            timerElement.classList.remove('warning');
            timerBar.classList.remove('warning');
        }
    }

    static async handleTimeUp() {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
        
        // Player loses the round due to time up
        if (!gameState.isAnimating) {
            gameState.isAnimating = true;
            
            // Play enemy attack animation
            await AnimationManager.playAttackAnimation(enemy, player, scene);
            await AnimationManager.playDamageAnimation(player, scene);
            
            gameState.playerHealth -= 20;
            sounds.damage.play();
            updateUI();
            
            if (gameState.playerHealth <= 0) {
                sounds.defeat.play();
                resetGame();
            } else {
                // Generate new problem
                gameState.currentProblem = ProblemGenerator.generateProblem(gameState.enemyLevel);
                updateProblemUI();
                this.startTimer(gameState.enemyLevel);
            }
            
            gameState.isAnimating = false;
        }
    }

    static stopTimer() {
        if (gameState.timerInterval) {
            clearInterval(gameState.timerInterval);
            gameState.timerInterval = null;
        }
    }
}

// Game initialization
const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas, true);

// Create scene with enhanced enemy appearance
const createScene = () => {
    const scene = new BABYLON.Scene(engine);
    
    // Camera setup
    const camera = new BABYLON.ArcRotateCamera(
        'camera',
        0,
        Math.PI / 3,
        10,
        BABYLON.Vector3.Zero(),
        scene
    );
    camera.attachControl(canvas, true);
    
    // Lighting
    const light = new BABYLON.HemisphericLight(
        'light',
        new BABYLON.Vector3(0, 1, 0),
        scene
    );
    
    // Create ground with texture
    const ground = BABYLON.MeshBuilder.CreateGround(
        'ground',
        { width: 20, height: 20 },
        scene
    );
    const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    groundMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    ground.material = groundMaterial;
    
    // Create player character with more detail
    const player = BABYLON.MeshBuilder.CreateBox(
        'player',
        { size: 1, height: 2 },
        scene
    );
    player.position = new BABYLON.Vector3(-3, 1, 0);
    const playerMaterial = new BABYLON.StandardMaterial('playerMaterial', scene);
    playerMaterial.diffuseColor = new BABYLON.Color3(0, 0.5, 1);
    player.material = playerMaterial;
    
    // Create enemy character with more detail
    const enemy = BABYLON.MeshBuilder.CreateBox(
        'enemy',
        { size: 1, height: 2 },
        scene
    );
    enemy.position = new BABYLON.Vector3(3, 1, 0);
    const enemyMaterial = new BABYLON.StandardMaterial('enemyMaterial', scene);
    enemyMaterial.diffuseColor = LEVEL_CONFIG.enemies[0].color;
    enemy.material = enemyMaterial;
    
    // Add particle effects for magic
    const particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);
    particleSystem.particleTexture = new BABYLON.Texture("assets/textures/flare.png", scene);
    particleSystem.emitter = player;
    particleSystem.minEmitBox = new BABYLON.Vector3(-0.5, 0, -0.5);
    particleSystem.maxEmitBox = new BABYLON.Vector3(0.5, 0, 0.5);
    particleSystem.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
    particleSystem.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.5;
    particleSystem.minLifeTime = 0.3;
    particleSystem.maxLifeTime = 1.5;
    particleSystem.emitRate = 0;
    particleSystem.start();
    
    return { scene, player, enemy, particleSystem };
};

// Initialize game
const { scene, player, enemy, particleSystem } = createScene();

// Start background music
sounds.background.play();

// Game loop
engine.runRenderLoop(() => {
    scene.render();
});

// Handle window resize
window.addEventListener('resize', () => {
    engine.resize();
});

// Update enemy appearance based on level
function updateEnemyAppearance(enemy, level) {
    const enemyConfig = LEVEL_CONFIG.enemies[level - 1];
    enemy.material.diffuseColor = enemyConfig.color;
    
    // Update enemy name in UI
    document.getElementById('enemyName').textContent = enemyConfig.name;
    
    // Special effects for final boss
    if (level === LEVEL_CONFIG.maxLevel) {
        // Add glowing effect
        enemy.material.emissiveColor = new BABYLON.Color3(0.5, 0, 0);
        // Make enemy slightly larger
        enemy.scaling = new BABYLON.Vector3(1.2, 1.2, 1.2);
    } else {
        enemy.material.emissiveColor = new BABYLON.Color3(0, 0, 0);
        enemy.scaling = new BABYLON.Vector3(1, 1, 1);
    }
}

// Update the UI Event Listeners section
document.getElementById('submitAnswer').addEventListener('click', async () => {
    if (gameState.isAnimating) return;
    gameState.isAnimating = true;
    
    const userAnswer = document.getElementById('answerInput').value;
    const correctAnswer = gameState.currentProblem.answer;
    
    TimerManager.stopTimer();
    
    if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
        particleSystem.emitRate = 100;
        await AnimationManager.playAttackAnimation(player, enemy, scene);
        sounds.playerHit.play();
        await AnimationManager.playDamageAnimation(enemy, scene);
        particleSystem.emitRate = 0;
        
        gameState.enemyHealth -= 20;
        sounds.attack.play();
        updateUI();
        
        if (gameState.enemyHealth <= 0) {
            await AnimationManager.playVictoryAnimation(player, scene);
            await AnimationManager.playVictoryEffect(scene);
            sounds.victory.play();
            
            if (gameState.enemyLevel < LEVEL_CONFIG.maxLevel) {
                // Immediately update level and health
                gameState.playerLevel++;
                gameState.enemyLevel++;
                gameState.enemyHealth = 100;
                gameState.score += 100;
                updateEnemyAppearance(enemy, gameState.enemyLevel);
                updateUI(); // Update UI immediately
                gameState.usedQuestions.clear();
                
                // Then play transition
                const isBossLevel = gameState.enemyLevel === LEVEL_CONFIG.maxLevel;
                await AnimationManager.playLevelTransitionAnimation(scene, isBossLevel);
            } else {
                showVictoryScreen();
            }
        }
    } else {
        await AnimationManager.playAttackAnimation(enemy, player, scene);
        sounds.enemyHit.play();
        await AnimationManager.playDamageAnimation(player, scene);
        
        gameState.playerHealth -= 20;
        sounds.damage.play();
        updateUI();
        
        if (gameState.playerHealth <= 0) {
            await AnimationManager.playDefeatEffect(scene);
            sounds.defeat.play();
            showContinueScreen();
            return; // Stop here and wait for player's continue decision
        }
    }
    
    gameState.currentProblem = ProblemGenerator.generateProblem(gameState.enemyLevel);
    updateProblemUI();
    TimerManager.startTimer(gameState.enemyLevel);
    gameState.isAnimating = false;
});

// Victory screen for defeating the final boss
function showVictoryScreen() {
    const victoryScreen = document.createElement('div');
    victoryScreen.id = 'victoryScreen';
    victoryScreen.innerHTML = `
        <div class="victory-content">
            <h1>Victory!</h1>
            <p>You have defeated Sir Eon!</p>
            <p>Final Score: ${gameState.score}</p>
            <button onclick="location.reload()">Play Again</button>
        </div>
    `;
    document.body.appendChild(victoryScreen);
}

// Update UI elements with animations
function updateUI() {
    const playerHealth = document.getElementById('playerHealth');
    const playerLevel = document.getElementById('playerLevel');
    const enemyHealth = document.getElementById('enemyHealth');
    const enemyLevel = document.getElementById('enemyLevel');
    
    // Animate health changes
    playerHealth.style.transition = 'color 0.3s ease';
    enemyHealth.style.transition = 'color 0.3s ease';
    
    playerHealth.textContent = `Health: ${gameState.playerHealth}`;
    playerLevel.textContent = `Level: ${gameState.playerLevel}`;
    enemyHealth.textContent = `Health: ${gameState.enemyHealth}`;
    enemyLevel.textContent = `Level: ${gameState.enemyLevel}`;
    
    // Flash effect for health changes
    playerHealth.style.color = '#ff0000';
    enemyHealth.style.color = '#ff0000';
    
    setTimeout(() => {
        playerHealth.style.color = '#FFD700';
        enemyHealth.style.color = '#FFD700';
    }, 300);
}

function updateProblemUI() {
    const problemText = document.getElementById('problemText');
    const answerInput = document.getElementById('answerInput');
    
    // Fade out
    problemText.style.opacity = '0';
    
    setTimeout(() => {
        problemText.textContent = gameState.currentProblem.question;
        answerInput.value = '';
        
        // Fade in
        problemText.style.opacity = '1';
    }, 300);
}

function resetGame() {
    TimerManager.stopTimer();
    if (gameState.continueTimerInterval) {
        clearInterval(gameState.continueTimerInterval);
    }
    gameState = {
        playerHealth: 100,
        playerLevel: 1,
        enemyHealth: 100,
        enemyLevel: 1,
        currentProblem: null,
        score: 0,
        isAnimating: false,
        timeRemaining: 0,
        timerInterval: null,
        currentEnemy: null,
        usedQuestions: new Set(),
        continueTimeRemaining: 10,
        continueTimerInterval: null
    };
    updateUI();
}

// Initialize first problem and timer
gameState.currentProblem = ProblemGenerator.generateProblem(1);
updateProblemUI();
updateUI();
TimerManager.startTimer(1);

// Show game UI with fade effect
const gameUI = document.getElementById('gameUI');
const loadingScreen = document.getElementById('loadingScreen');

gameUI.style.opacity = '0';
gameUI.classList.remove('hidden');

setTimeout(() => {
    gameUI.style.opacity = '1';
    loadingScreen.classList.add('hidden');
}, 500);

// Add continue screen HTML
function showContinueScreen() {
    const continueScreen = document.createElement('div');
    continueScreen.id = 'continueScreen';
    continueScreen.innerHTML = `
        <div class="continue-content">
            <h1>Defeat!</h1>
            <p>Continue your quest?</p>
            <p class="continue-timer">10</p>
            <div class="continue-buttons">
                <button id="continueButton">Continue</button>
                <button id="gameOverButton">Game Over</button>
            </div>
        </div>
    `;
    document.body.appendChild(continueScreen);

    // Start continue countdown
    gameState.continueTimeRemaining = 10;
    updateContinueTimer();
    
    gameState.continueTimerInterval = setInterval(() => {
        gameState.continueTimeRemaining--;
        updateContinueTimer();
        
        if (gameState.continueTimeRemaining <= 0) {
            clearInterval(gameState.continueTimerInterval);
            showGameOverScreen();
        }
    }, 1000);

    // Add event listeners
    document.getElementById('continueButton').addEventListener('click', () => {
        clearInterval(gameState.continueTimerInterval);
        continueScreen.remove();
        continueGame();
    });

    document.getElementById('gameOverButton').addEventListener('click', () => {
        clearInterval(gameState.continueTimerInterval);
        continueScreen.remove();
        showGameOverScreen();
    });
}

function updateContinueTimer() {
    const timerElement = document.querySelector('.continue-timer');
    if (timerElement) {
        timerElement.textContent = gameState.continueTimeRemaining;
        
        // Add warning class when time is low
        if (gameState.continueTimeRemaining <= 3) {
            timerElement.classList.add('warning');
        } else {
            timerElement.classList.remove('warning');
        }
    }
}

function showGameOverScreen() {
    const gameOverScreen = document.createElement('div');
    gameOverScreen.id = 'gameOverScreen';
    gameOverScreen.innerHTML = `
        <div class="game-over-content">
            <h1>Game Over</h1>
            <p>Final Score: ${gameState.score}</p>
            <button onclick="location.reload()">Play Again</button>
        </div>
    `;
    document.body.appendChild(gameOverScreen);
    
    // Stop all game timers
    TimerManager.stopTimer();
    if (gameState.continueTimerInterval) {
        clearInterval(gameState.continueTimerInterval);
    }
}

function continueGame() {
    // Reset player health
    gameState.playerHealth = 100;
    updateUI();
    
    // Generate new problem and start timer
    gameState.currentProblem = ProblemGenerator.generateProblem(gameState.enemyLevel);
    updateProblemUI();
    TimerManager.startTimer(gameState.enemyLevel);
    gameState.isAnimating = false;
} 