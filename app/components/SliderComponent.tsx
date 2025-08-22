import React from 'react'
import DiscreteSliderSteps from "../components/Slider"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const SliderComponent = () => {
  return (
    <div className="moodSliderComponent w-full flex flex-row flex-wrap gap-12 content-center justify-center pb-8">
        <div className="mood-card">
            <Card className="w-sm border border-[#CE2746]/25 shadow-[0_0_4px_0_#CE2746]/25 rounded-4xl">
            <CardHeader>
                <CardTitle className="text-2xl text-[#3B3D40] font-normal text-center">How&apos;s your mood?</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center content-center p-2">
                <DiscreteSliderSteps/>
            </CardContent>
            </Card>
        </div>

        <div className="energy-card">
            <Card className="w-sm border border-[#CE2746]/25 shadow-[0_0_4px_0_#CE2746]/25 rounded-4xl">
            <CardHeader>
                <CardTitle className="text-2xl text-[#3B3D40] font-normal text-center">How energetic do you feel?</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center content-center p-2">
                <DiscreteSliderSteps/>
            </CardContent>
            </Card>
        </div>

        <div className="stress-card">
            <Card className="w-sm border border-[#CE2746]/25 shadow-[0_0_4px_0_#CE2746]/25 rounded-4xl">
            <CardHeader>
                <CardTitle className="text-2xl text-[#3B3D40] font-normal text-center">How stressed do you feel?</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center content-center p-2">
                <DiscreteSliderSteps />
            </CardContent>
            </Card>
        </div>
    </div>
  )
}

export default SliderComponent