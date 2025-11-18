import { cn } from '@/lib/utils.ts'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useTheme } from 'next-themes'
import React, { CSSProperties } from 'react'
import Map, { Marker } from 'react-map-gl/mapbox'

const MiniMap: React.FC<{
  style?: CSSProperties
  points: {
    className?: string
    latitude: number
    longitude: number
  }[]
}> = ({ style, points }) => {
  const theme = useTheme()

  return (
    <Map
      initialViewState={
        points.length
          ? {
              ...points[0],
              zoom: 5,
            }
          : undefined
      }
      mapStyle={
        theme.theme === 'dark'
          ? 'mapbox://styles/mapbox/dark-v11'
          : 'mapbox://styles/mapbox/light-v11'
      }
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
      style={{ width: '100%', height: '8rem', borderRadius: '0.5rem', ...style }}
      interactive={true}
    >
      {points.map(({ latitude, longitude, className }, index) => (
        <Marker key={index} latitude={latitude} longitude={longitude} anchor="bottom">
          <div className={cn('rounded-4xl h-2 w-2 bg-red-600', className)}></div>
        </Marker>
      ))}
    </Map>
  )
}

export default MiniMap
