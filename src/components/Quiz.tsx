import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, ArrowLeft, RotateCcw, Play, Check, Menu, X } from 'lucide-react';
import { parseQuiz } from '../data/parser';
import { questionsText1, answersText1 } from '../data/raw1';
import { questionsText2, answersText2 } from '../data/raw2';

export default function Quiz() {
  const [quizState, setQuizState] = useState<'start' | 'playing' | 'results'>('start');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersHistory, setAnswersHistory] = useState<Record<number, { selectedId: string, isCorrect: boolean }>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Combine and parse questions
  const allQuestions = useMemo(() => {
    const q1 = parseQuiz(questionsText1, answersText1);
    const q2 = parseQuiz(questionsText2, answersText2);
    return [...q1, ...q2];
  }, []);

  const score = Object.values(answersHistory).filter(h => h.isCorrect).length;
  const historyForCurrent = answersHistory[currentIndex];
  const isAnswered = historyForCurrent !== undefined;
  const selectedOption = isAnswered ? historyForCurrent.selectedId : null;

  const startQuiz = () => {
    setCurrentIndex(0);
    setAnswersHistory({});
    setQuizState('playing');
  };

  const handleSelectOption = (optionId: string) => {
    if (isAnswered) return;
    
    const currentQ = allQuestions[currentIndex];
    const isCorrect = optionId === currentQ.correctAnswerId;

    setAnswersHistory(prev => ({
      ...prev,
      [currentIndex]: { selectedId: optionId, isCorrect }
    }));
  };

  const handleNext = () => {
    if (currentIndex < allQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setQuizState('results');
    }
  };

  // -----------------------------------------------------
  // Renders
  // -----------------------------------------------------

  // Helper to correctly render mixed Arabic/English text and chemical formulas
  const formatMixedText = (text: string) => {
    // Split by sequences of English letters, numbers, and basic chemical/punctuation symbols
    // The optional non-capturing group allows spaces BETWEEN English/number words.
    const parts = text.split(/([a-zA-Z0-9\-\(\)\[\]\+\=\,\.\'≡]+(?: [a-zA-Z0-9\-\(\)\[\]\+\=\,\.\'≡]+)*)/g);
    
    return parts.map((part, i) => {
      // If it contains an English letter or number, isolate it as LTR
      if (/[a-zA-Z0-9]/.test(part)) {
        // Sub-parse chemical numbers (e.g. CH3 -> CH₃, NO2 -> NO₂)
        const renderChemicalSubscripts = (str: string) => {
          // Identify letters followed directly by digits (e.g. H2, C3)
          const subParts = str.split(/([A-Za-z]\d+)/g);
          return subParts.map((subPart, j) => {
            if (/^[A-Za-z]\d+$/.test(subPart)) {
              return (
                <span key={j}>
                  {subPart.charAt(0)}
                  <sub className="relative text-[0.7em] -bottom-1 font-semibold">{subPart.slice(1)}</sub>
                </span>
              );
            }
            return <span key={j}>{subPart}</span>;
          });
        };

        return (
          <span 
            key={i} 
            dir="ltr" 
            className="mx-1 inline-block text-[#3A3A2E] font-sans font-semibold tracking-wide whitespace-nowrap text-left"
            style={{ unicodeBidi: 'bidi-override' }}
          >
            {renderChemicalSubscripts(part)}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  if (allQuestions.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-xl text-red-500 font-bold">عذراً، فشل في تحميل الأسئلة.</p>
      </div>
    );
  }

  if (quizState === 'start') {
    return (
      <div className="flex h-screen items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-8 text-center border border-[#D6D0C2]"
        >
          <div className="w-20 h-20 bg-[#D4A373] text-white rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold">
            🧪
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#5A5A40] mb-4">
            اختبار الكيمياء العضوية الشامل
          </h1>
          <p className="text-[#7A7A6A] mb-8 text-lg">
            اختبر معلوماتك مع {allQuestions.length} سؤال تفاعلي يغطي التسمية النظامية (IUPAC)، المجموعات الوظيفية، والتفاعلات.
          </p>
          <button 
            onClick={startQuiz}
            className="w-full bg-[#5A5A40] hover:bg-[#4A4A30] text-white font-bold py-4 px-8 rounded-full flex items-center justify-center gap-3 transition-colors text-lg"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>ابدأ الاختبار الآن</span>
          </button>
        </motion.div>
      </div>
    );
  }

  if (quizState === 'results') {
    const percentage = Math.round((score / allQuestions.length) * 100);
    let message = 'جيد، لكن يمكنك تقديم المزيد!';
    let color = 'text-[#D4A373]';
    if (percentage >= 85) {
      message = 'عمل رائع! أنت خبير في الكيمياء العضوية!';
      color = 'text-[#5A5A40]';
    } else if (percentage < 50) {
      message = 'تحتاج إلى المزيد من المراجعة.';
      color = 'text-[#A09A8E]';
    }

    return (
      <div className="flex min-h-screen items-center justify-center p-6 py-12 bg-[#F5F2ED]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-8 text-center border border-[#D6D0C2]"
        >
          <h2 className="text-3xl font-serif font-bold text-[#5A5A40] mb-2">النتيجة النهائية</h2>
          <div className="text-7xl font-sans font-black my-8 text-[#3A3A2E]">
            {score} <span className="text-3xl text-[#7A7A6A]">/ {allQuestions.length}</span>
          </div>
          <div className={`text-2xl font-bold mb-8 ${color}`}>
            {percentage}% - {message}
          </div>
          <button 
            onClick={startQuiz}
            className="w-full bg-[#D4A373] hover:bg-[#c39262] text-white font-bold py-4 px-8 rounded-full flex items-center justify-center gap-3 transition-colors text-lg"
          >
            <RotateCcw className="w-6 h-6" />
            <span>إعادة الاختبار</span>
          </button>
        </motion.div>
      </div>
    );
  }

  // PLAYING STATE
  const currentQ = allQuestions[currentIndex];
  // Calculate progress based on answered questions
  const answeredCount = Object.keys(answersHistory).length;
  const progressPercent = (answeredCount / allQuestions.length) * 100;

  return (
    <div className="flex bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJub25lIiBzdHJva2U9IiM1QTVBNDAiIHN0cm9rZS13aWR0aD0iMC41IiBzdHJva2UtZGFzaGFycmF5PSI0LCA0IiBvcGFjaXR5PSIwLjA1Ii8+PC9zdmc+')] bg-repeat min-h-screen relative">
      
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 0.5 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Map */}
      <aside className={`fixed right-0 top-0 bottom-0 z-50 w-72 bg-[#E9E4DB] border-l border-[#D6D0C2] flex flex-col transition-transform duration-300 md:h-screen md:sticky overflow-y-auto ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0 shrink-0 shadow-2xl md:shadow-none`}>
        <div className="p-4 border-b border-[#D6D0C2] bg-[#E1DBD0] sticky top-0 z-10 flex justify-between items-center">
          <div>
            <h2 className="font-serif font-bold text-[#5A5A40] mb-1">مسار الأسئلة</h2>
            <p className="text-xs text-[#7A7A6A]">تمت الإجابة على {answeredCount} من أصل {allQuestions.length} سؤال</p>
          </div>
          <button className="md:hidden text-[#5A5A40]" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4 bg-[#E1DBD0] border-b border-[#D6D0C2] sticky top-[73px] z-10">
           <div className="w-full bg-[#D6D0C2] h-1.5 rounded-full overflow-hidden">
             <div className="bg-[#5A5A40] h-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
           </div>
        </div>
        <div className="flex-1 p-4 grid grid-cols-5 gap-2 content-start">
          {allQuestions.map((_, i) => {
            const hist = answersHistory[i];
            let btnClass = "border-[#C9C2B5] bg-white text-[#A09A8E] hover:border-[#5A5A40]"; // Unanswered
            if (hist) {
              btnClass = hist.isCorrect ? "bg-[#5A5A40] text-white border-[#5A5A40]" : "bg-[#D4A373] text-white border-[#D4A373]";
            }
            if (currentIndex === i) {
              btnClass += " ring-2 ring-offset-2 ring-[#5A5A40] border-[#5A5A40]";
            }
            return (
              <button
                key={i}
                onClick={() => {
                  setCurrentIndex(i);
                  setIsSidebarOpen(false);
                }}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs border transition-all ${btnClass}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-4 md:p-8 max-w-4xl mx-auto w-full">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 bg-[#E1DBD0] border border-[#D6D0C2] p-4 rounded-2xl">
          <div className="flex items-center gap-3">
             <button className="md:hidden p-2 rounded-lg bg-white border border-[#D6D0C2]" onClick={() => setIsSidebarOpen(true)}>
               <Menu className="w-5 h-5 text-[#5A5A40]"/>
             </button>
             <div className="font-bold text-[#5A5A40]">
               السؤال <span className="text-[#3A3A2E] text-lg mx-1">{currentIndex + 1}</span> من {allQuestions.length}
             </div>
          </div>
          <div className="font-bold text-[#D4A373] bg-white px-4 py-2 rounded-xl border border-[#D6D0C2]">
            النقاط: {score}
          </div>
        </header>

        {/* Question Area */}
        <main className="flex-grow flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="flex-grow flex flex-col"
            >
              <div className="mb-8 text-center pt-4">
                <span className="inline-block px-3 py-1 bg-[#E1DBD0] text-[#5A5A40] text-xs font-bold rounded-md mb-4 border border-[#D6D0C2]">
                  سؤال رقم {currentIndex + 1}
                </span>
                <h2 className="text-2xl md:text-3xl font-serif text-[#3A3A2E] leading-relaxed" dir="rtl">
                  {formatMixedText(currentQ.text.replace(/^\d+\.\s*/, ''))}
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {currentQ.options.map((opt) => {
                  const isSelected = selectedOption === opt.id;
                  const isCorrect = isAnswered && opt.id === currentQ.correctAnswerId;
                  const isWrongSelected = isAnswered && isSelected && !isCorrect;

                  let btnClass = "bg-white border-2 border-[#D6D0C2] text-[#4A4A40] hover:border-[#5A5A40] hover:bg-[#F9F8F6]";
                  
                  if (isAnswered) {
                    if (isCorrect) {
                       btnClass = "bg-[#f4f7f4] border-2 border-[#5A5A40] text-[#3A3A2E] shadow-sm ring-4 ring-[#5A5A40]/10";
                    } else if (isWrongSelected) {
                       btnClass = "bg-white border-2 border-[#D4A373] text-[#A09A8E] ring-4 ring-[#D4A373]/20";
                    } else {
                       btnClass = "bg-white border-2 border-[#D6D0C2] text-[#A09A8E] opacity-50"; 
                    }
                  } else if (isSelected) {
                     btnClass = "bg-[#5A5A40] border-[#5A5A40] text-white";
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      disabled={isAnswered}
                      className={`w-full text-right p-6 rounded-2xl transition-all duration-200 font-sans text-xl flex items-center justify-between group ${btnClass}`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`w-10 h-10 flex items-center justify-center rounded-full font-bold ${isAnswered && isCorrect ? 'bg-[#5A5A40] text-white' : isAnswered && isWrongSelected ? 'bg-[#D4A373] text-white' : 'bg-[#F5F2ED] text-[#5A5A40] group-hover:bg-[#5A5A40] group-hover:text-white'}`}>
                          {opt.id}
                        </span>
                        <span className="font-bold">{formatMixedText(opt.text)}</span>
                      </div>
                      {isAnswered && isCorrect && <CheckCircle className="w-6 h-6 text-[#5A5A40] shrink-0" />}
                      {isAnswered && isWrongSelected && <XCircle className="w-6 h-6 text-[#D4A373] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Next Button Footer */}
          <div className="mt-12 h-20">
            {isAnswered && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleNext}
                className="w-full md:w-auto md:min-w-[200px] float-left bg-[#5A5A40] text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <span>{currentIndex < allQuestions.length - 1 && !answersHistory[currentIndex + 1] ? 'السؤال التالي' : currentIndex < allQuestions.length - 1 ? 'انتقل للسؤال التالي' : 'عرض النتيجة'}</span>
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
