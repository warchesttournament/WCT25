// Функция для переключения видимости расписания
function toggleSchedule(scheduleId) {
    const scheduleDiv = document.getElementById(scheduleId);
    if (scheduleDiv.style.display === 'none' || scheduleDiv.style.display === '') {
        scheduleDiv.style.display = 'block';
    } else {
        scheduleDiv.style.display = 'none';
    }
}

// Привязка обработчиков событий для ссылок "Подробнее"
document.getElementById('toggleA').addEventListener('click', function() {
    toggleSchedule('scheduleA');
});
document.getElementById('toggleB').addEventListener('click', function() {
    toggleSchedule('scheduleB');
});

// Загрузка данных из data.json
fetch('data/result.json')
    .then(response => response.json())
    .then(data => {
        function calculateStats(group) {
            const stats = {};

            group.forEach(match => {
                console.log(match); // Выводим для отладки

                const players = [match.player1, match.player2];
                players.forEach(player => {
                    if (!stats[player]) {
                        stats[player] = {
                            matches: 0,
                            wins: 0,
                            draws: 0,
                            losses: 0,
                            goals: 0,
                            conceded: 0,
                            points: 0
                        };
                    }
                });

                match.matches.forEach((scores) => {
                    if (!Array.isArray(scores) || scores.length !== 2) {
                        console.warn(`Некорректные данные для матча между ${match.player1} и ${match.player2}:`, scores);
                        return; // Пропускаем некорректные данные
                    }

                    const [score1, score2] = scores;

                    if (score1 > score2) {
                        stats[match.player1].wins++;
                        stats[match.player2].losses++;
                        stats[match.player1].points += 3;
                    } else if (score1 < score2) {
                        stats[match.player2].wins++;
                        stats[match.player1].losses++;
                        stats[match.player2].points += 3;
                    } else {
                        stats[match.player1].draws++;
                        stats[match.player2].draws++;
                        stats[match.player1].points++;
                        stats[match.player2].points++;
                    }

                    stats[match.player1].goals += score1;
                    stats[match.player2].goals += score2;
                    stats[match.player1].conceded += score2;
                    stats[match.player2].conceded += score1;
                    stats[match.player1].matches++;
                    stats[match.player2].matches++;
                });
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
                    <td>${playerStats.matches}</td>
                    <td>${playerStats.wins}</td>
                    <td>${playerStats.draws}</td>
                    <td>${playerStats.losses}</td>
                    <td>${playerStats.goals - playerStats.conceded}</td>
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
                    <p><strong>${match.player1} против ${match.player2}</strong></p>
                    <ul>
                        <li>1-й тайм: ${match.matches[0].score1} : ${match.matches[0].score2}</li>
                        <li>2-й тайм: ${match.matches[1].score1} : ${match.matches[1].score2}</li>
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
