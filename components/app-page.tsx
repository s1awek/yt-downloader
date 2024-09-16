'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function Page() {
  const [inputType, setInputType] = useState<'video' | 'channel'>('video');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: inputType, value: inputValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transcription');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${inputType === 'video' ? 'video' : 'channel'}_transcription.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('An error occurred while fetching the transcription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container mx-auto max-w-md p-4'>
      <h1 className='text-2xl font-bold mb-4'>YouTube Transcription Downloader</h1>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <RadioGroup value={inputType} onValueChange={(value) => setInputType(value as 'video' | 'channel')}>
          <div className='flex items-center space-x-2'>
            <RadioGroupItem value='video' id='video' />
            <Label htmlFor='video'>Single Video</Label>
          </div>
          <div className='flex items-center space-x-2'>
            <RadioGroupItem value='channel' id='channel' />
            <Label htmlFor='channel'>Entire Channel</Label>
          </div>
        </RadioGroup>
        <div className='space-y-2'>
          <Label htmlFor='input'>{inputType === 'video' ? 'YouTube Video URL' : 'YouTube Channel ID'}</Label>
          <Input
            id='input'
            type='text'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={inputType === 'video' ? 'https://www.youtube.com/watch?v=...' : 'UCxxxxxxxxxxxxxxxxxxxxxxxx'}
            required
          />
        </div>
        <Button type='submit' disabled={loading}>
          {loading ? 'Downloading...' : 'Download Transcription'}
        </Button>
      </form>
      {error && <p className='text-red-500 mt-4'>{error}</p>}
    </div>
  );
}
