class Morpion {
	humanPlayer = 'J1';
	iaPlayer = 'J2';
	gameOver = false;
	gridMap = [
		[null, null, null],
		[null, null, null],
		[null, null, null],
	];

	constructor(firstPlayer = 'J1') {
		this.humanPlayer = firstPlayer;
		this.iaPlayer = (firstPlayer === 'J1') ? 'J2' : 'J1';
		this.initGame();
	}

	initGame = () => {
		this.gridMap.forEach((line, y) => {
			line.forEach((cell, x) => {
				this.getCell(x, y).onclick = () => {
					this.doPlayHuman(x, y);
				};
			});
		});

		if (this.iaPlayer === 'J1') {
			this.doPlayIa();
		}
	}

	getCell = (x, y) => {
		const column = x + 1;
		const lines = ['A', 'B', 'C'];
		const cellId = `${lines[y]}${column}`;
		return document.getElementById(cellId);
	}

    getBoardWinner = (board) => {
        const isWinningRow = ([a, b, c]) => (
            a !== null && a === b && b === c
        );

        let winner = null;

        // Horizontal
        board.forEach((line) => {
            if (isWinningRow(line)) {
                winner = line[0];
            }
        });

        // Vertical
        [0, 1, 2].forEach((col) => {
            if (isWinningRow([board[0][col], board[1][col], board[2][col]])) {
                winner = board[0][col];
            }
        });

        if (winner) {
            return winner;
        }

        // Diagonal
        const diagonal1 = [board[0][0], board[1][1], board[2][2]];
        const diagonal2 = [board[0][2], board[1][1], board[2][0]];
        if (isWinningRow(diagonal1) || isWinningRow(diagonal2)) {
            return board[1][1];
        }

        const isFull = board.every((line) => (
			line.every((cell) => cell !== null)
		));
        return isFull ? 'tie' : null;
    }

	checkWinner = (lastPlayer) => {
        const winner = this.getBoardWinner(this.gridMap);
        if (!winner) {
            return;
        }

        this.gameOver = true;
        switch(winner) {
            case 'tie':
			    this.displayEndMessage("Vous êtes à égalité !");
                break;
            case this.iaPlayer:
                this.displayEndMessage("L'IA a gagné !");
                break;
            case this.humanPlayer:
                this.displayEndMessage("Tu as battu l'IA !");
                break;
        }
	}

	displayEndMessage = (message) => {
		const endMessageElement = document.getElementById('end-message');
		endMessageElement.textContent = message;
		endMessageElement.style.display = 'block';
	}

	drawHit = (x, y, player) => {
		if (this.gridMap[y][x] !== null) {
			return false;
		}

		this.gridMap[y][x] = player;
		this.getCell(x, y).classList.add(`filled-${player}`);
		this.checkWinner(player);
		return true;
	}

	doPlayHuman = (x, y) => {
		if (this.gameOver) {
			return;
		}

		if (this.drawHit(x, y, this.humanPlayer)) {
			this.doPlayIa();
		}
	}

	doPlayIa = () => {

		if (this.gameOver) {
			return;
		}

		let tree = new Tree(this.gridMap, this);
		tree.computePossibilities();
		let position = tree.bestMove()

		let hasPlayed = false;
		hasPlayed = this.drawHit(position.y, position.x, this.iaPlayer);
				

	}
}

class Tree {
	constructor(board, game) {
		this.rootNode = new Node(board, this);
		this.game = game;
		this.rootNode.player = this.game.humanPlayer;
	}

	applyScore(node) {
		node.score = this.computeScore(node);
		return node.score;
	}

	computeScore(node) {
		const isWinningRow = ([a, b, c]) => a !== null && a === b && b === c;

		let board = node.values;
		let score = 0;

		// Horizontal
		board.forEach((line) => {
			if (isWinningRow(line)) {
				if (line[0] == this.game.iaPlayer) {
					score += 1000;
				} else {
					score -= 1000;
				}
			}
		});

		// Vertical
		[0, 1, 2].forEach((col) => {
			if (isWinningRow([board[0][col], board[1][col], board[2][col]])) {
				if (board[0][col] == this.game.iaPlayer) {
					score += 1000;
				} else {
					score -= 1000;
				}
			}
		});

		// Diagonal
		const diagonal1 = [board[0][0], board[1][1], board[2][2]];
		const diagonal2 = [board[0][2], board[1][1], board[2][0]];

		[diagonal1, diagonal2].forEach((diagonal) => {
			if (isWinningRow(diagonal)) {
				if (board[1][1] == this.game.iaPlayer) {
					score += 1000;
				} else {
					score -= 1000;
				}
			}
		});

		return score;
	}

	computePossibilities(node = this.rootNode, depth = 0) {
		this.applyScore(node);
		node.values.forEach((valueX, x) => {
			valueX.forEach((valueY, y) => {
				if (valueY === null && depth < 4) {
					let newPossibility = [...node.values].map((emt) => (emt = [...emt]));

					let child;
					if (node.player === node.tree.game.iaPlayer) {
						newPossibility[x][y] = node.tree.game.humanPlayer;
						child = new Node(newPossibility, this, x, y);
						child.player = node.tree.game.humanPlayer;
					} else if (node.player === node.tree.game.humanPlayer) {
						newPossibility[x][y] = node.tree.game.iaPlayer;
						child = new Node(newPossibility, this, x, y);
						child.player = node.tree.game.iaPlayer;
					} else {
						newPossibility[x][y] = "J1";
						child = new Node(newPossibility, this, x, y);
						child.player = "J1";
					}

					node.childs.push(child);
					depth++;
					this.computePossibilities(child, depth);
					depth--;
				}
			});
		});
	}

	bestMove(node = this.rootNode) {
		let move;
		let move2;
		let move3;
		let winmove;
		let childs = node.childs.filter((child) => child.score >= 0);
		if (childs.length > 0) {

			childs.forEach((child) => {
				// 1

				if (child.score > 0) {
					winmove = child;
				}

				if (child.childs.every((subchild) => subchild.score >= 0)) {
					move = child;
					child.childs.forEach((subchild) => {
						// 2

						if (
							subchild.childs.every((subsubchild) => subsubchild.score >= 0)
						) {
							move2 = child;
							subchild.childs.forEach((subsubchild) => {
								// 3

								if (
									subsubchild.childs.every(
										(subsubchild) => subsubchild.score >= 0 )) {
									// 4
									move3 = child;
								}
							});
						}
					});
				}
			});
		}

		if (move == null){
			move = node.childs[0]
		}

		if (node.values == [[null, null, null],[null, null, null],[null, null, null],]){
			return {x: 1, y: 1}
		}
		
			if (winmove) {
				return {x: winmove.x, y: winmove.y};
			} else if (move3) {
				return {x: move3.x, y: move3.y};
			} else if (move2) {
				return {x: move2.x, y: move2.y};
			}

		return {x: move.x, y: move.y};
	}
}

class Node {
	constructor(values, tree, x=0, y=0) {
		this.values = values;
		this.score;
		this.childs = [];
		this.tree = tree;
		this.player;
		this.x = x;
		this.y = y;
	}
}
