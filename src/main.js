import * as BABYLON from '@babylonjs/core';
import { Howl } from 'howler';

// Game state
let gameState = {
    playerHealth: 100,
    playerLevel: 1,
    enemyHealth: 100,
    enemyLevel: 1,
    currentProblem: null,
    score: 0,
    isAnimating: false
};

// Sound effects
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
    victory: new Howl({
        src: ['assets/sounds/victory.mp3']
    }),
    defeat: new Howl({
        src: ['assets/sounds/defeat.mp3']
    })
};

// Problem generator
class ProblemGenerator {
    static generateProblem(level) {
        const problemTypes = [
            this.generateAlgebraProblem,
            this.generateGeometryProblem,
            this.generateLogicProblem
        ];
        
        const selectedType = problemTypes[Math.floor(Math.random() * problemTypes.length)];
        return selectedType(level);
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
}

// Game initialization
const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas, true);

// Create scene
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
    enemyMaterial.diffuseColor = new BABYLON.Color3(1, 0.2, 0.2);
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

// UI Event Listeners
document.getElementById('submitAnswer').addEventListener('click', async () => {
    if (gameState.isAnimating) return;
    gameState.isAnimating = true;
    
    const userAnswer = document.getElementById('answerInput').value;
    const correctAnswer = gameState.currentProblem.answer;
    
    if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
        // Player wins the round
        particleSystem.emitRate = 100;
        await AnimationManager.playAttackAnimation(player, enemy, scene);
        await AnimationManager.playDamageAnimation(enemy, scene);
        particleSystem.emitRate = 0;
        
        gameState.enemyHealth -= 20;
        sounds.attack.play();
        updateUI();
        
        if (gameState.enemyHealth <= 0) {
            // Player wins the battle
            await AnimationManager.playVictoryAnimation(player, scene);
            sounds.victory.play();
            gameState.playerLevel++;
            gameState.enemyLevel++;
            gameState.enemyHealth = 100;
            gameState.score += 100;
        }
    } else {
        // Player loses the round
        await AnimationManager.playAttackAnimation(enemy, player, scene);
        await AnimationManager.playDamageAnimation(player, scene);
        
        gameState.playerHealth -= 20;
        sounds.damage.play();
        updateUI();
        
        if (gameState.playerHealth <= 0) {
            // Player loses the battle
            sounds.defeat.play();
            resetGame();
        }
    }
    
    // Generate new problem
    gameState.currentProblem = ProblemGenerator.generateProblem(gameState.enemyLevel);
    updateProblemUI();
    gameState.isAnimating = false;
});

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
    gameState = {
        playerHealth: 100,
        playerLevel: 1,
        enemyHealth: 100,
        enemyLevel: 1,
        currentProblem: null,
        score: 0,
        isAnimating: false
    };
    updateUI();
}

// Initialize first problem
gameState.currentProblem = ProblemGenerator.generateProblem(1);
updateProblemUI();
updateUI();

// Show game UI with fade effect
const gameUI = document.getElementById('gameUI');
const loadingScreen = document.getElementById('loadingScreen');

gameUI.style.opacity = '0';
gameUI.classList.remove('hidden');

setTimeout(() => {
    gameUI.style.opacity = '1';
    loadingScreen.classList.add('hidden');
}, 500); 