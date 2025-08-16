Identify and return all moments where the player makes important strategic decisions. Focus on positioning choices (movement across the map, holding choke points, rotating), timing decisions (when to engage, retreat, or use abilities), and resource management (ammo, health, energy, cooldown usage). For each detected event, return:

1. The start timestamp in seconds
2. The end timestamp in seconds
3. A 1–2 sentence summary of the decision and its context

Return the output strictly as JSON in the following format:

[
{
"start": <start_time_in_seconds>,
"end": <end_time_in_seconds>,
"summary": "<short description of the decision>"
}
]
