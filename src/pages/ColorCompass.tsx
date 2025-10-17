import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, RotateCcw } from 'lucide-react';

const generateRandomColor = () => {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
};

const generateColorPool = (count: number) => {
  return Array.from({ length: count }, () => generateRandomColor());
};

// Helper function to generate a pool that includes the targets
const generatePool = (targetColors: string[]) => {
  // 1. Get 8 random colors that are NOT already targets
  const nonTargetColors = Array.from({ length: 8 }, () => {
    let newColor = generateRandomColor();
    // Simple check to ensure the filler colors are unique from targets (optional, but good)
    while (targetColors.includes(newColor)) {
      newColor = generateRandomColor();
    }
    return newColor;
  });

  // 2. Combine targets and non-targets
  const fullPool = [...targetColors, ...nonTargetColors];

  // 3. Shuffle the array to mix them up
  for (let i = fullPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [fullPool[i], fullPool[j]] = [fullPool[j], fullPool[i]];
  }

  return fullPool;
};

// New function to handle color generation for a new round
const initializeRoundColors = (currentScore: number) => {
    // Generate 4 new target colors
    const newTargetColors = generateColorPool(4);
    
    // Generate the pool ensuring targets are included
    const newColorPool = generatePool(newTargetColors);
    
    return { 
        newTargetColors, 
        newColorPool 
    };
};

export default function ColorCompass() {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'ended'>('ready');
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [targetColors, setTargetColors] = useState<string[]>([]);
  const [colorPool, setColorPool] = useState<string[]>([]);

  useEffect(() => {
    const savedHighScore = localStorage.getItem('colorCompassHighScore');
    if (savedHighScore) setHighScore(parseInt(savedHighScore));
  }, []);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      endGame();
    }
  }, [gameState, timeLeft]);

  const startGame = () => {
    // Initialize the first set of colors
    const { newTargetColors, newColorPool } = initializeRoundColors(0); 

    setGameState('playing');
    setTimeLeft(60);
    setScore(0);
    setTargetColors(newTargetColors);
    setColorPool(newColorPool);
};

  const endGame = () => {
    setGameState('ended');
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('colorCompassHighScore', score.toString());
    }
  };

  const handleColorClick = (color: string) => {

    if (targetColors.includes(color)) {
      const newScore = score + 10;
      setScore(newScore);

      // Get the targets that remain AFTER the successful match
      const remainingTargets = targetColors.filter(c => c !== color);

      if (remainingTargets.length === 0) {
        // Round complete, generate new colors
        const { newTargetColors, newColorPool } = initializeRoundColors(newScore);
        setTargetColors(newTargetColors);
        setColorPool(newColorPool);
      } else {
        // Only update the targets state
        setTargetColors(remainingTargets);
      }
      
    } else {
      setScore(Math.max(0, score - 5));
    }
};

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
            Color Compass
          </h1>
          <p className="text-muted-foreground">
            Match the target colors from the pool as fast as you can!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-primary">{timeLeft}s</div>
              <div className="text-sm text-muted-foreground">Time Left</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold">{score}</div>
              <div className="text-sm text-muted-foreground">Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold flex items-center justify-center gap-2">
                <Trophy className="w-6 h-6 text-primary" />
                {highScore}
              </div>
              <div className="text-sm text-muted-foreground">High Score</div>
            </CardContent>
          </Card>
        </div>

        {gameState === 'ready' && (
          <div className="text-center py-12">
            <Button size="lg" onClick={startGame}>
              Start Game
            </Button>
          </div>
        )}

        {gameState === 'playing' && (
          <>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-center">Target Colors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {targetColors.map((color) => (
                    <div
                      key={color}
                      className="aspect-square rounded-lg border-2 border-primary"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Color Pool</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {colorPool.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorClick(color)}
                      className="aspect-square rounded-lg border-2 border-border hover:border-primary transition-all hover:scale-105 cursor-pointer"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {gameState === 'ended' && (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
            <p className="text-xl text-muted-foreground mb-2">Final Score: {score}</p>
            {score === highScore && score > 0 && (
              <p className="text-primary mb-6 flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5" />
                New High Score!
              </p>
            )}
            <Button size="lg" onClick={startGame} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Play Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
