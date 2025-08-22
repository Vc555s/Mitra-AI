"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AnimatedList, { Therapist } from '@/components/AnimatedList/AnimatedList';
import HorizontalFilters from '@/components/horizontal-filters';
import { therapists } from '../../../lib/dummyTherapists';

// Define FilterState interface based on horizontal-filters component
interface FilterState {
  specialisation: string[];
  disorders: string[];
  counselling: string[];
  sortBy: string;
}

const HeartLine = () => {
    const router = useRouter();
    const [filteredTherapists, setFilteredTherapists] = useState<Therapist[]>(therapists);
    const [activeFilters, setActiveFilters] = useState<FilterState>({
        specialisation: [],
        disorders: [],
        counselling: [],
        sortBy: "featured",
    });

    useEffect(() => {
        let updatedList = [...therapists];

        // Filtering logic
        if (activeFilters.specialisation.length > 0) {
            updatedList = updatedList.filter(therapist => 
                activeFilters.specialisation.some(spec => therapist.specialisation.includes(spec))
            );
        }
        if (activeFilters.disorders.length > 0) {
            updatedList = updatedList.filter(therapist => 
                activeFilters.disorders.some(disorder => therapist.disorders.includes(disorder))
            );
        }
        if (activeFilters.counselling.length > 0) {
            updatedList = updatedList.filter(therapist => 
                activeFilters.counselling.some(counsel => therapist.counselling.includes(counsel))
            );
        }

        // Sorting logic
        switch (activeFilters.sortBy) {
            case 'exp-desc':
                updatedList.sort((a, b) => b.experience - a.experience);
                break;
            case 'exp-asc':
                updatedList.sort((a, b) => a.experience - b.experience);
                break;
            case 'newest':
                updatedList.sort((a, b) => b.id - a.id);
                break;
            case 'featured':
            default:
                // Default order or you can implement a featured logic
                updatedList.sort((a, b) => a.id - b.id);
                break;
        }

        setFilteredTherapists(updatedList);
    }, [activeFilters]);

    const handleFilterChange = (filters: FilterState) => {
        setActiveFilters(filters);
    };

    const handleTherapistSelect = (therapist: Therapist) => {
        // Corrected path to match the full URL structure and include the ID
        router.push(`/main-app/heart-line/selected-therapist?id=${therapist.id}`);
    };
 
    return (
      <div className="flex flex-col min-h-screen bg-[#FAF6F3] font-sans">
        <header className="flex-shrink-0 bg-[#FAF6F3] backdrop-blur-sm z-10">
            <div className="navbar bg-transparent max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="navbar-start"></div>
                <div className="navbar-center">
                    <h1 className="text-3xl md:text-5xl text-[#6B2A7D] font-bold">Heart Line</h1>
                </div>
                <div className="navbar-end"></div>
            </div>
        </header>

        <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <section className="py-6 md:py-8">
                <HorizontalFilters onFilterChange={handleFilterChange} />
            </section>

            <section className="pb-8">
                <AnimatedList
                    items={filteredTherapists}
                    onItemSelect={handleTherapistSelect}
                />
            </section>
        </main>
      </div>
    );
}

export default HeartLine;
