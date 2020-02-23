//! Text tokenization and word-frequency extraction.

use wordcloud_types::WordFrequency;

const STOP_WORDS: &[&str] = &["the", "a", "an", "and", "or", "的", "了", "和", "是", "在"];

/// Tokenize text into weighted word frequencies.
pub fn tokenize_text(text: &str, min_length: usize, max_length: usize) -> Vec<WordFrequency> {
    let lower = text.to_lowercase();
    let mut tokens = Vec::new();

    for chunk in lower.split_whitespace() {
        push_token(chunk, min_length, max_length, &mut tokens);
    }

    for segment in extract_cjk(&lower) {
        push_token(&segment, min_length, max_length, &mut tokens);
    }

    let mut frequencies = std::collections::HashMap::new();
    for token in tokens {
        if STOP_WORDS.iter().any(|stop| stop == &token) {
            continue;
        }
        *frequencies.entry(token).or_insert(0.0) += 1.0;
    }

    frequencies.into_iter().map(|(word, frequency)| WordFrequency::new(word, frequency)).collect()
}

fn push_token(token: &str, min_length: usize, max_length: usize, out: &mut Vec<String>) {
    let trimmed = token.trim_matches(|c: char| !c.is_alphanumeric() && (c as u32) < 0x4E00);
    if trimmed.len() >= min_length && trimmed.len() <= max_length {
        out.push(trimmed.to_string());
    }
}

fn extract_cjk(text: &str) -> Vec<String> {
    let mut segments = Vec::new();
    let mut current = String::new();

    for ch in text.chars() {
        if ('\u{4E00}'..='\u{9FFF}').contains(&ch) {
            current.push(ch);
        } else if !current.is_empty() {
            segments.push(current.clone());
            current.clear();
        }
    }

    if !current.is_empty() {
        segments.push(current);
    }

    segments
}
