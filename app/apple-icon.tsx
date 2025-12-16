import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'
 
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'white',
        }}
      >
        <svg width="180" height="180" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="256" cy="256" rx="120" ry="180" fill="#E5A922"/>
          <ellipse cx="200" cy="256" rx="15" ry="160" fill="#FFF"/>
          <ellipse cx="256" cy="256" rx="15" ry="180" fill="#FFF"/>
          <ellipse cx="312" cy="256" rx="15" ry="160" fill="#FFF"/>
          <rect x="236" y="80" width="40" height="30" rx="5" fill="#B8860B"/>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}

