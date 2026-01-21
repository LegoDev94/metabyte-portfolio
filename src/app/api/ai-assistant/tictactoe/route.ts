import { NextRequest, NextResponse } from "next/server";

type CellValue = "X" | "O" | null;
type BoardState = CellValue[];

interface TicTacToeRequest {
  board: BoardState;
  playerSymbol: "X" | "O";
  userName?: string;
}

// Winning combinations
const WINNING_LINES = [
  [0, 1, 2], // rows
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6], // columns
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8], // diagonals
  [2, 4, 6],
];

// Check if there's a winner
function checkWinner(board: BoardState): CellValue {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

// Get empty cells
function getEmptyCells(board: BoardState): number[] {
  return board.map((cell, i) => (cell === null ? i : -1)).filter((i) => i !== -1);
}

// Check if board is full
function isBoardFull(board: BoardState): boolean {
  return board.every((cell) => cell !== null);
}

// Minimax algorithm for optimal play
function minimax(
  board: BoardState,
  depth: number,
  isMaximizing: boolean,
  aiSymbol: CellValue,
  playerSymbol: CellValue
): number {
  const winner = checkWinner(board);

  // Terminal states
  if (winner === aiSymbol) return 10 - depth;
  if (winner === playerSymbol) return depth - 10;
  if (isBoardFull(board)) return 0;

  const emptyCells = getEmptyCells(board);

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (const cell of emptyCells) {
      board[cell] = aiSymbol;
      const score = minimax(board, depth + 1, false, aiSymbol, playerSymbol);
      board[cell] = null;
      bestScore = Math.max(bestScore, score);
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (const cell of emptyCells) {
      board[cell] = playerSymbol;
      const score = minimax(board, depth + 1, true, aiSymbol, playerSymbol);
      board[cell] = null;
      bestScore = Math.min(bestScore, score);
    }
    return bestScore;
  }
}

// Find the best move using minimax
function findBestMove(board: BoardState, aiSymbol: CellValue, playerSymbol: CellValue): number {
  const emptyCells = getEmptyCells(board);
  let bestScore = -Infinity;
  let bestMove = emptyCells[0];

  for (const cell of emptyCells) {
    board[cell] = aiSymbol;
    const score = minimax(board, 0, false, aiSymbol, playerSymbol);
    board[cell] = null;

    if (score > bestScore) {
      bestScore = score;
      bestMove = cell;
    }
  }

  return bestMove;
}

// Find winning move for a player
function findWinningMove(board: BoardState, symbol: CellValue): number | null {
  const emptyCells = getEmptyCells(board);

  for (const cell of emptyCells) {
    board[cell] = symbol;
    if (checkWinner(board) === symbol) {
      board[cell] = null;
      return cell;
    }
    board[cell] = null;
  }
  return null;
}

// Get strategic comment based on game state
function getComment(
  board: BoardState,
  move: number,
  aiSymbol: CellValue,
  playerSymbol: CellValue
): string {
  // Check if AI is about to win
  const boardCopy = [...board];
  boardCopy[move] = aiSymbol;
  if (checkWinner(boardCopy) === aiSymbol) {
    const winComments = [
      "И это победа! 🏆",
      "Чекмейт! 😎",
      "Вот так вот! Победа моя!",
      "GG! Я выиграл!",
      "Финальный удар! 💥",
    ];
    return winComments[Math.floor(Math.random() * winComments.length)];
  }

  // Check if AI blocked player's win
  const blockMove = findWinningMove([...board], playerSymbol);
  if (blockMove === move) {
    const blockComments = [
      "Не так быстро! Блокирую! 🛡️",
      "Думал, я не замечу? 👀",
      "Хороший ход, но я внимателен!",
      "Ха! Заблокировано!",
      "Не сегодня, дружок!",
    ];
    return blockComments[Math.floor(Math.random() * blockComments.length)];
  }

  // Center move
  if (move === 4) {
    const centerComments = [
      "Центр - лучшая позиция! 🎯",
      "Классика - занимаю центр!",
      "Стратегическая точка!",
    ];
    return centerComments[Math.floor(Math.random() * centerComments.length)];
  }

  // Corner moves
  if ([0, 2, 6, 8].includes(move)) {
    const cornerComments = [
      "Угол - отличный выбор! 📐",
      "Укрепляю позиции в углу!",
      "Тактический ход в угол!",
    ];
    return cornerComments[Math.floor(Math.random() * cornerComments.length)];
  }

  // Regular moves
  const regularComments = [
    "Хм, интересная партия! 🤔",
    "Моя очередь!",
    "А я вот сюда...",
    "Продолжаем!",
    "Посмотрим, что ты на это скажешь!",
    "Неплохо играешь!",
  ];
  return regularComments[Math.floor(Math.random() * regularComments.length)];
}

export async function POST(request: NextRequest) {
  try {
    const body: TicTacToeRequest = await request.json();
    const { board, playerSymbol } = body;

    const aiSymbol: CellValue = playerSymbol === "X" ? "O" : "X";
    const emptyCells = getEmptyCells(board);

    if (emptyCells.length === 0) {
      return NextResponse.json({ error: "No empty cells" }, { status: 400 });
    }

    // Make a copy of the board for calculations
    const boardCopy = [...board] as BoardState;

    // Find the best move using minimax
    const bestMove = findBestMove(boardCopy, aiSymbol, playerSymbol);

    // Get appropriate comment
    const comment = getComment(board, bestMove, aiSymbol, playerSymbol);

    return NextResponse.json({
      move: bestMove,
      comment,
    });
  } catch (error) {
    console.error("TicTacToe API error:", error);

    // Emergency fallback - still try to make a smart move
    try {
      const body = await request.clone().json();
      const emptyCells = getEmptyCells(body.board);
      if (emptyCells.length > 0) {
        // Prefer center, then corners, then edges
        const preferredOrder = [4, 0, 2, 6, 8, 1, 3, 5, 7];
        const move = preferredOrder.find((pos) => emptyCells.includes(pos)) ?? emptyCells[0];
        return NextResponse.json({
          move,
          comment: "Хм, тогда сюда!",
        });
      }
    } catch {
      // Ignore
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
