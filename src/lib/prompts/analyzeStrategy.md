Detect and return all high-skill mechanical execution moments. Focus on accuracy (precise aim, headshots, consistent hits), reaction times (fast responses to threats, dodges, or counters), and combos (stringing multiple actions together efficiently). For each detected event, return:

1. The start timestamp in seconds
2. The end timestamp in seconds
3. A 1–2 sentence summary describing the mechanical skill performed

Return the output strictly as JSON in the following format:

[
{
"start": <start_time_in_seconds>,
"end": <end_time_in_seconds>,
"summary": "<short description of the decision>"
}
]
