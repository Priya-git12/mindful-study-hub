import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Music, Gamepad2, Puzzle, Grid3X3, Brain, ExternalLink, Play, RotateCcw } from "lucide-react";
import { useState } from "react";

const musicPlatforms = [
  { name: "Spotify - Focus Playlists", url: "https://open.spotify.com/genre/focus-page", icon: "🎵" },
  { name: "YouTube - Lo-Fi Beats", url: "https://www.youtube.com/results?search_query=lofi+beats+to+study", icon: "📺" },
  { name: "Brain.fm", url: "https://www.brain.fm", icon: "🧠" },
  { name: "Calm - Relaxing Music", url: "https://www.calm.com", icon: "🌿" },
];

// Simple Memory Match Game
function MemoryGame() {
  const emojis = ["🎯", "💡", "🌟", "📚", "🎨", "🔮", "🌈", "⚡"];
  const [cards, setCards] = useState(() => shuffleCards());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  function shuffleCards() {
    const doubled = [...emojis, ...emojis];
    return doubled.sort(() => Math.random() - 0.5);
  }

  function handleCardClick(index: number) {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      if (cards[newFlipped[0]] === cards[newFlipped[1]]) {
        setMatched(m => [...m, ...newFlipped]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  }

  function resetGame() {
    setCards(shuffleCards());
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  }

  const isComplete = matched.length === cards.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Moves: {moves}</span>
        <Button variant="outline" size="sm" onClick={resetGame}>
          <RotateCcw className="h-4 w-4 mr-1" /> Reset
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {cards.map((emoji, index) => (
          <button
            key={index}
            onClick={() => handleCardClick(index)}
            className={`aspect-square rounded-lg text-2xl flex items-center justify-center transition-all duration-300 ${
              flipped.includes(index) || matched.includes(index)
                ? "bg-primary/20 border-primary"
                : "bg-muted hover:bg-muted/80"
            } border-2`}
          >
            {flipped.includes(index) || matched.includes(index) ? emoji : "?"}
          </button>
        ))}
      </div>
      {isComplete && (
        <p className="text-center text-success font-medium">Completed in {moves} moves!</p>
      )}
    </div>
  );
}

// Simple Number Puzzle (Sliding Puzzle)
function NumberPuzzle() {
  const [tiles, setTiles] = useState(() => generatePuzzle());
  const [moves, setMoves] = useState(0);

  function generatePuzzle(): (number | null)[] {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, null];
    // Simple shuffle that's always solvable
    for (let i = arr.length - 2; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function canMove(index: number): boolean {
    const emptyIndex = tiles.indexOf(null);
    const row = Math.floor(index / 3);
    const emptyRow = Math.floor(emptyIndex / 3);
    const col = index % 3;
    const emptyCol = emptyIndex % 3;

    return (
      (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
      (col === emptyCol && Math.abs(row - emptyRow) === 1)
    );
  }

  function handleTileClick(index: number) {
    if (!canMove(index)) return;

    const newTiles = [...tiles];
    const emptyIndex = tiles.indexOf(null);
    [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
    setTiles(newTiles);
    setMoves(m => m + 1);
  }

  function resetGame() {
    setTiles(generatePuzzle());
    setMoves(0);
  }

  const isSolved = tiles.slice(0, 8).every((t, i) => t === i + 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Moves: {moves}</span>
        <Button variant="outline" size="sm" onClick={resetGame}>
          <RotateCcw className="h-4 w-4 mr-1" /> Reset
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
        {tiles.map((tile, index) => (
          <button
            key={index}
            onClick={() => handleTileClick(index)}
            disabled={tile === null}
            className={`aspect-square rounded-lg text-xl font-bold flex items-center justify-center transition-all ${
              tile === null
                ? "bg-transparent"
                : canMove(index)
                ? "bg-primary text-primary-foreground hover:opacity-80 cursor-pointer"
                : "bg-muted cursor-default"
            }`}
          >
            {tile}
          </button>
        ))}
      </div>
      {isSolved && moves > 0 && (
        <p className="text-center text-success font-medium">Solved in {moves} moves!</p>
      )}
    </div>
  );
}

// Simple Color Pattern Game
function ColorPattern() {
  const colors = ["bg-primary", "bg-secondary", "bg-accent", "bg-wellness"];
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showingSequence, setShowingSequence] = useState(false);
  const [activeColor, setActiveColor] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  function startGame() {
    const newSequence = [Math.floor(Math.random() * 4)];
    setSequence(newSequence);
    setPlayerSequence([]);
    setIsPlaying(true);
    setScore(0);
    showSequence(newSequence);
  }

  function showSequence(seq: number[]) {
    setShowingSequence(true);
    seq.forEach((color, index) => {
      setTimeout(() => {
        setActiveColor(color);
        setTimeout(() => setActiveColor(null), 400);
      }, index * 600);
    });
    setTimeout(() => setShowingSequence(false), seq.length * 600);
  }

  function handleColorClick(colorIndex: number) {
    if (showingSequence || !isPlaying) return;

    const newPlayerSequence = [...playerSequence, colorIndex];
    setPlayerSequence(newPlayerSequence);

    // Check if wrong
    if (sequence[newPlayerSequence.length - 1] !== colorIndex) {
      setIsPlaying(false);
      return;
    }

    // Check if complete
    if (newPlayerSequence.length === sequence.length) {
      setScore(s => s + 1);
      const newSequence = [...sequence, Math.floor(Math.random() * 4)];
      setSequence(newSequence);
      setPlayerSequence([]);
      setTimeout(() => showSequence(newSequence), 500);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Score: {score}</span>
        <Button variant="outline" size="sm" onClick={startGame}>
          <Play className="h-4 w-4 mr-1" /> {isPlaying ? "Restart" : "Start"}
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3 max-w-[180px] mx-auto">
        {colors.map((color, index) => (
          <button
            key={index}
            onClick={() => handleColorClick(index)}
            className={`aspect-square rounded-lg transition-all duration-200 ${color} ${
              activeColor === index ? "opacity-100 scale-110" : "opacity-60 hover:opacity-80"
            }`}
          />
        ))}
      </div>
      {!isPlaying && score > 0 && (
        <p className="text-center text-muted-foreground">Game Over! Final score: {score}</p>
      )}
    </div>
  );
}

// Breathing Exercise
function BreathingExercise() {
  const [phase, setPhase] = useState<"idle" | "inhale" | "hold" | "exhale">("idle");
  const [isActive, setIsActive] = useState(false);

  function startExercise() {
    setIsActive(true);
    runCycle();
  }

  function runCycle() {
    setPhase("inhale");
    setTimeout(() => {
      setPhase("hold");
      setTimeout(() => {
        setPhase("exhale");
        setTimeout(() => {
          setPhase("inhale");
        }, 4000);
      }, 4000);
    }, 4000);
  }

  function stopExercise() {
    setIsActive(false);
    setPhase("idle");
  }

  return (
    <div className="space-y-4 text-center">
      <div
        className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all duration-[4000ms] ${
          phase === "inhale"
            ? "scale-125 bg-primary/30"
            : phase === "hold"
            ? "scale-125 bg-secondary/30"
            : phase === "exhale"
            ? "scale-100 bg-accent/30"
            : "scale-100 bg-muted"
        }`}
      >
        <span className="text-lg font-medium capitalize">
          {phase === "idle" ? "Ready" : phase}
        </span>
      </div>
      <Button
        variant={isActive ? "outline" : "default"}
        onClick={isActive ? stopExercise : startExercise}
      >
        {isActive ? "Stop" : "Start Breathing"}
      </Button>
      <p className="text-xs text-muted-foreground">
        4-4-4 breathing: Inhale 4s, Hold 4s, Exhale 4s
      </p>
    </div>
  );
}

export default function Breaks() {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const games = [
    { id: "memory", name: "Memory Match", icon: Puzzle, description: "Match pairs of cards", component: MemoryGame },
    { id: "puzzle", name: "Number Puzzle", icon: Grid3X3, description: "Slide tiles to solve", component: NumberPuzzle },
    { id: "pattern", name: "Color Pattern", icon: Brain, description: "Remember the sequence", component: ColorPattern },
    { id: "breathing", name: "Breathing", icon: Brain, description: "Relaxation exercise", component: BreathingExercise },
  ];

  const ActiveGameComponent = games.find(g => g.id === activeGame)?.component;

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Take a Break
        </h1>
        <p className="text-muted-foreground">Recharge with music, games, and relaxation</p>
      </motion.div>

      {/* Music Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6 shadow-card border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary p-3 rounded-xl">
              <Music className="h-6 w-6 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-semibold">Listen to Music</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {musicPlatforms.map((platform, index) => (
              <a
                key={index}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
              >
                <span className="text-2xl">{platform.icon}</span>
                <span className="flex-1 text-sm font-medium">{platform.name}</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Games Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6 shadow-card border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-secondary p-3 rounded-xl">
              <Gamepad2 className="h-6 w-6 text-secondary-foreground" />
            </div>
            <h2 className="text-xl font-semibold">Quick Mind Games</h2>
          </div>

          {activeGame ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{games.find(g => g.id === activeGame)?.name}</h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveGame(null)}>
                  ← Back to games
                </Button>
              </div>
              <div className="max-w-sm mx-auto">
                {ActiveGameComponent && <ActiveGameComponent />}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {games.map((game, index) => (
                <button
                  key={game.id}
                  onClick={() => setActiveGame(game.id)}
                  className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all hover:-translate-y-1 text-center group"
                >
                  <game.icon className="h-8 w-8 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                  <p className="font-medium text-sm">{game.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{game.description}</p>
                </button>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Quick Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6 shadow-card border-border/50 bg-gradient-wellness text-wellness-foreground">
          <h2 className="text-xl font-bold mb-4">💡 Break Tips</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-background/10 rounded-lg p-4">
              <h3 className="font-semibold mb-1">5-Minute Break</h3>
              <p className="text-sm opacity-90">Stretch, walk around, or do a quick breathing exercise.</p>
            </div>
            <div className="bg-background/10 rounded-lg p-4">
              <h3 className="font-semibold mb-1">15-Minute Break</h3>
              <p className="text-sm opacity-90">Listen to music, play a quick game, or grab a healthy snack.</p>
            </div>
            <div className="bg-background/10 rounded-lg p-4">
              <h3 className="font-semibold mb-1">30-Minute Break</h3>
              <p className="text-sm opacity-90">Take a short walk, meditate, or do light exercise.</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
