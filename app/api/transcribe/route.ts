import { NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';
import he from 'he'; // Dodaj tę linię na górze pliku

export async function POST(req: Request) {
  try {
    const { type, value } = await req.json();
    let transcriptions = '';

    if (type === 'video') {
      const transcript = await YoutubeTranscript.fetchTranscript(value);
      transcriptions = transcript
        .map((item) => he.decode(item.text))
        .join(' ')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&');
    } else if (type === 'channel') {
      // For simplicity, we'll just return an error for channel requests
      // as it requires additional setup with the YouTube Data API
      return NextResponse.json({ error: 'Channel transcription not implemented yet' }, { status: 501 });
    }

    return new NextResponse(transcriptions, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="${type === 'video' ? 'video' : 'channel'}_transcription.txt"`,
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch transcription' }, { status: 500 });
  }
}
