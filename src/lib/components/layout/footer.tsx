"use client"

import * as React from "react"

export function Footer() {
  const [currentTime, setCurrentTime] = React.useState(new Date())

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatDate = (date: Date) => {
    const days = [
      "Pazar",
      "Pazartesi",
      "Salı",
      "Çarşamba",
      "Perşembe",
      "Cuma",
      "Cumartesi",
    ]
    const months = [
      "Ocak",
      "Şubat",
      "Mart",
      "Nisan",
      "Mayıs",
      "Haziran",
      "Temmuz",
      "Ağustos",
      "Eylül",
      "Ekim",
      "Kasım",
      "Aralık",
    ]

    const day = days[date.getDay()]
    const dayNum = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")
    const seconds = date.getSeconds().toString().padStart(2, "0")

    return {
      day,
      dayNum,
      month,
      year,
      time: `${hours}:${minutes}:${seconds}`,
    }
  }

  const dateInfo = formatDate(currentTime)

  return (
    <footer className="sticky bottom-0 z-50 w-full border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span className="font-medium">
              {dateInfo.dayNum} {dateInfo.month} {dateInfo.year}
            </span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-2">
            <span>🗓️</span>
            <span className="font-medium">{dateInfo.day}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-2">
            <span>🕐</span>
            <span className="font-mono font-semibold text-foreground">
              {dateInfo.time}
            </span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          © {dateInfo.year} MIRELLO. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  )
}

