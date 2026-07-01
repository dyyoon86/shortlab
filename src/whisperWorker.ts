/// <reference lib="webworker" />
import { pipeline, type PipelineType } from '@huggingface/transformers'

// Whisper 파이프라인을 한 번만 만들어 재사용한다.
let transcriber: any = null

async function getTranscriber(onProgress: (p: any) => void) {
  if (transcriber) return transcriber
  transcriber = await pipeline(
    'automatic-speech-recognition' as PipelineType,
    'Xenova/whisper-small',
    { progress_callback: onProgress },
  )
  return transcriber
}

self.onmessage = async (e: MessageEvent) => {
  const { audio } = e.data as { audio: Float32Array }
  try {
    const t = await getTranscriber((p) => {
      // 모델 파일 다운로드 진행률
      if (p.status === 'progress') {
        self.postMessage({
          type: 'download',
          file: p.file,
          progress: p.progress ?? 0,
        })
      }
    })

    self.postMessage({ type: 'status', message: '음성을 글자로 바꾸는 중…' })

    const output = await t(audio, {
      language: 'korean',
      task: 'transcribe',
      chunk_length_s: 30,
      stride_length_s: 5,
      return_timestamps: true,
    })

    self.postMessage({ type: 'done', result: output })
  } catch (err) {
    self.postMessage({
      type: 'error',
      message: err instanceof Error ? err.message : String(err),
    })
  }
}
