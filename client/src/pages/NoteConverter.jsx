'use strict';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAIConvert } from '../hooks/useAI';
import { Button } from '@/components/ui/button';
import { PRIORITY_COLORS, CATEGORY_COLORS } from '../lib/enums';

export default function NoteConverter() {
  const [note, setNote] = useState('');
  const [result, setResult] = useState(null);
  const convert = useAIConvert();

  function handleSubmit(e) {
    e.preventDefault();
    if (!note.trim()) return;
    setResult(null);
    convert.mutate(note.trim(), {
      onSuccess: (data) => setResult(data),
    });
  }

  function handleReset() {
    setNote('');
    setResult(null);
    convert.reset();
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="text-slate-500 text-sm hover:underline mb-4 inline-block">
          ← Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 mt-2 mb-2">Note Converter</h1>
        <p className="text-slate-500 mb-8">
          Paste a free-form development note and Claude will extract a structured task for you.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            className="border border-slate-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none bg-white"
            placeholder="e.g. the auth endpoint breaks when the JWT token expires — it throws a 500 instead of returning a 401"
            rows={6}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={convert.isPending}
          />
          <div className="flex gap-3">
            <Button type="submit" disabled={convert.isPending || !note.trim()}>
              {convert.isPending ? 'Converting…' : 'Convert to task'}
            </Button>
            {(result || convert.isError) && (
              <Button type="button" variant="outline" onClick={handleReset}>
                Reset
              </Button>
            )}
          </div>
        </form>

        {convert.isError && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
            {convert.error?.message || 'Something went wrong. Try again.'}
          </div>
        )}

        {result && (
          <div className="mt-8 bg-white border border-slate-200 rounded-lg shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-semibold text-slate-900 leading-snug">{result.title}</h2>
              <div className="flex gap-2 shrink-0">
                <span className={`text-xs font-medium px-2 py-1 rounded ${PRIORITY_COLORS[result.priority]}`}>
                  {result.priority}
                </span>
                <span className={`text-xs font-medium px-2 py-1 rounded ${CATEGORY_COLORS[result.category]}`}>
                  {result.category}
                </span>
              </div>
            </div>
            {result.description && (
              <p className="text-slate-600 text-sm leading-relaxed">{result.description}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
