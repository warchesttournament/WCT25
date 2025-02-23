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
                        if (game.score1 === null || game.score2 === null || (game.score1 === 0 && game.score2 === 0)) return;
                        stats[match.player1].goalDifference += (game.score1 - game.score2);
                        stats[match.player2].goalDifference += (game.score2 - game.score1);
                        game.score1 > game.score2 ? player1Wins++ : game.score1 < game.score2 ? player2Wins++ : null;
                    });

                    if (player1Wins > 0 || player2Wins > 0) {
                        stats[match.player1].played++;
                        stats[match.player2].played++;
                    }

                    if (player1Wins > player2Wins) {
                        stats[match.player1].wins++;
                        stats[match.player1].points += 2;
                        stats[match.player2].losses++;
                    } else if (player2Wins > player1Wins) {
                        stats[match.player2].wins++;
                        stats[match.player2].points += 2;
                        stats[match.player1].losses++;
                    } else if (player1Wins === player2Wins && player1Wins > 0) {
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
                return stats;
            }

            function renderSchedule(group, groupName) {
                const scheduleDiv = document.getElementById(`schedule${groupName}`);
                scheduleDiv.innerHTML = '';
                group.forEach(match => {
                    const matchDiv = document.createElement('div');
                    matchDiv.classList.add('match-details');
                    matchDiv.innerHTML = `
                        <p><strong>${match.player1} ⚔️ ${match.player2}</strong></p>
                        <ul>
                            <li>${match.matches[0].score1} : ${match.matches[0].score2}</li>
                            <li>${match.matches[1].score1} : ${match.matches[1].score2}</li>
                        </ul>
                    `;
                    scheduleDiv.appendChild(matchDiv);
                });
            }

            function renderSemifinalAndFinal(groupAStats, groupBStats) {
                const topA = Object.keys(groupAStats).sort((a, b) => groupAStats[b].points - groupAStats[a].points).slice(0, 2);
                const topB = Object.keys(groupBStats).sort((a, b) => groupBStats[b].points - groupBStats[a].points).slice(0, 2);

                const semifinalMatches = [
                    { player1: topA[0], player2: topB[1] },
                    { player1: topB[0], player2: topA[1] }
                ];

                const semifinalTable = document.querySelector("#semifinal tbody");
                semifinalTable.innerHTML = '';
                semifinalMatches.forEach(match => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${match.player1}</td>
                        <td>—</td>
                        <td>${match.player2}</td>
                    `;
                    semifinalTable.appendChild(row);
                });

                const finalTable = document.querySelector("#final tbody");
                finalTable.innerHTML = `
                    <tr>
                        <td>—</td>
                        <td>—</td>
                        <td>—</td>
                    </tr>
                `;
            }

            const groupAStats = renderTable(data.groupA, 'groupA');
            const groupBStats = renderTable(data.groupB, 'groupB');
            renderSchedule(data.groupA, 'A');
            renderSchedule(data.groupB, 'B');
            renderSemifinalAndFinal(groupAStats, groupBStats);
        })
        .catch(error => console.error('Ошибка загрузки данных:', error));
});
