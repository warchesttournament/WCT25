document.addEventListener("DOMContentLoaded", () => {
    function toggleSchedule(scheduleId) {
        const scheduleDiv = document.getElementById(scheduleId);
        scheduleDiv.style.display = scheduleDiv.style.display === 'none' || scheduleDiv.style.display === '' ? 'block' : 'none';
    }

    document.getElementById('toggleA').addEventListener('click', () => toggleSchedule('scheduleA'));
    document.getElementById('toggleB').addEventListener('click', () => toggleSchedule('scheduleB'));

    fetch('data/result.json')
        .then(response => response.json())
        .then(data => {
            function calculateStats(group) {
                const stats = {};
                group.forEach(match => {
                    const players = [match.player1, match.player2];
                    players.forEach(player => {
                        if (!stats[player]) {
                            stats[player] = { played: 0, wins: 0, draws: 0, losses: 0, goalDifference: 0, points: 0 };
                        }
                    });

                    let player1Wins = 0, player2Wins = 0;
                    match.matches.forEach(game => {
                        if (game.score1 === null || game.score2 === null) return;
                        stats[match.player1].goalDifference += (game.score1 - game.score2);
                        stats[match.player2].goalDifference += (game.score2 - game.score1);
                        game.score1 > game.score2 ? player1Wins++ : game.score1 < game.score2 ? player2Wins++ : null;
                    });

                    if (player1Wins > 0 || player2Wins > 0) {
                        stats[match.player1].played++;
                        stats[match.player2].played++;
                    }

                    if (player1Wins === 2) {
                        stats[match.player1].wins++;
                        stats[match.player1].points += 2;
                        stats[match.player2].losses++;
                    } else if (player2Wins === 2) {
                        stats[match.player2].wins++;
                        stats[match.player2].points += 2;
                        stats[match.player1].losses++;
                    } else if (player1Wins === 1 && player2Wins === 1) {
                        stats[match.player1].draws++;
                        stats[match.player2].draws++;
                        stats[match.player1].points++;
                        stats[match.player2].points++;
                    }
                });
                return stats;
            }

            function renderTable(group, groupName) {
                const stats = calculateStats(group);
                const tbody = document.querySelector(`#${groupName} tbody`);
                tbody.innerHTML = '';
                Object.keys(stats).forEach(player => {
                    const playerStats = stats[player];
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${player}</td>
                        <td>${playerStats.played}</td>
                        <td>${playerStats.wins}</td>
                        <td>${playerStats.draws}</td>
                        <td>${playerStats.losses}</td>
                        <td>${playerStats.goalDifference}</td>
                        <td>${playerStats.points}</td>
                    `;
                    tbody.appendChild(row);
                });
            }

            function renderSchedule(group, groupName) {
                const scheduleDiv = document.getElementById(`schedule${groupName}`);
                scheduleDiv.innerHTML = '';
                group.forEach(match => {
                    const matchDiv = document.createElement('div');
                    matchDiv.classList.add('match-details');
                    matchDiv.innerHTML = `
                        <p><strong>${match.player1} vs ${match.player2}</strong></p>
                        <ul>
                            <li>${match.matches[0].score1} : ${match.matches[0].score2}</li>
                            <li>${match.matches[1].score1} : ${match.matches[1].score2}</li>
                        </ul>
                    `;
                    scheduleDiv.appendChild(matchDiv);
                });
            }

            renderTable(data.groupA, 'groupA');
            renderTable(data.groupB, 'groupB');
            renderSchedule(data.groupA, 'A');
            renderSchedule(data.groupB, 'B');
        })
        .catch(error => console.error('Ошибка загрузки данных:', error));
});
