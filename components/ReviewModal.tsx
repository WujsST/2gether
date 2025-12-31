import React, { useState } from 'react';
import { Star, ThumbsUp, MessageSquare } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    // Logic: If rating >= 4 (on 5 star scale), send to Google. Else internal.
    setSubmitted(true);
  };

  const isHighScore = rating >= 4;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {!submitted ? (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">You're All Set! 🎉</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">How would you rate your onboarding experience?</p>

            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setRating(star)}
                  onClick={() => setRating(star)}
                  className={`transition-all transform hover:scale-110 ${
                    rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 dark:text-slate-600'
                  }`}
                >
                  <Star className="w-8 h-8" fill={rating >= star ? "currentColor" : "none"} />
                </button>
              ))}
            </div>

            {rating > 0 && (
               <div className="animate-in fade-in slide-in-from-bottom-4">
                 {rating < 4 && (
                   <textarea
                     value={feedback}
                     onChange={(e) => setFeedback(e.target.value)}
                     placeholder="What could we have done better?"
                     className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white p-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none mb-4 h-24 resize-none placeholder-slate-400 dark:placeholder-slate-500"
                   />
                 )}
                 
                 <button
                   onClick={handleSubmit}
                   className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                 >
                   {rating >= 4 ? 'Submit Review' : 'Send Feedback'}
                 </button>
               </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center animate-in fade-in">
             <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ThumbsUp className="w-8 h-8 text-green-600 dark:text-green-500" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Thank you!</h3>
             
             {isHighScore ? (
               <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">We are glad you liked it! Would you mind sharing that on Google?</p>
                  <a 
                    href="#" // Would be real Google Maps link
                    target="_blank"
                    className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 px-6 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
                  >
                    <Star className="w-4 h-4 fill-current" />
                    Review on Google
                  </a>
                  <button onClick={onClose} className="block w-full mt-4 text-slate-500 hover:text-slate-700 dark:hover:text-white text-sm">No thanks</button>
               </div>
             ) : (
               <div>
                 <p className="text-slate-600 dark:text-slate-400 mb-6">Your feedback has been sent directly to our team. We'll work on it!</p>
                 <button 
                  onClick={onClose}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white py-2 px-6 rounded-xl transition-colors"
                 >
                   Close
                 </button>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};