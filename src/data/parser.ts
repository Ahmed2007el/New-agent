export interface Question {
  id: number;
  text: string;
  options: { id: string; text: string }[];
  correctAnswerId: string;
}

export function parseQuiz(qText: string, aText: string): Question[] {
  const answerLines = aText.split('\n');
  const answerKey: Record<number, string> = {};
  
  answerLines.forEach(line => {
    // Matches "1. ب" or "119. ب (ميثوكسي ميثان...)" carefully
    const match = line.match(/^(\d+)\.\s*([أبجد])/);
    if (match) {
      answerKey[parseInt(match[1])] = match[2];
    }
  });

  // Split by newlines followed by number and dot, e.g., "\n2. "
  const blocks = qText.split(/(?:^|\n)(?=\d+\.\s+)/).map(s => s.trim()).filter(s => s.length > 0);
  const questions: Question[] = [];

  blocks.forEach(block => {
    // Match the question body and options: أ) ... ب) ... ج) ... د) ...
    // Using [\s\S]+? to safely handle newlines inside questions if any
    const match = block.match(/^(\d+)\.\s+([\s\S]+?)\s+أ\)\s+([\s\S]+?)\s+ب\)\s+([\s\S]+?)\s+ج\)\s+([\s\S]+?)\s+د\)\s+([\s\S]+)$/);

    if (match) {
      const qId = parseInt(match[1]);
      questions.push({
        id: qId,
        text: match[2].trim(),
        options: [
          { id: 'أ', text: match[3].trim() },
          { id: 'ب', text: match[4].trim() },
          { id: 'ج', text: match[5].trim() },
          { id: 'د', text: match[6].trim() }
        ],
        // Default to 'أ' if parsing fails, but it shouldn't
        correctAnswerId: answerKey[qId] || 'أ',
      });
    } else {
      console.warn('Failed to parse question block:', block);
    }
  });

  return questions;
}
