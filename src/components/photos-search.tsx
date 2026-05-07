import InputText from "./input-text";
import SearchIcon from "../assets/icons/search.svg?react";
import React, { useState } from "react";
import { debounce } from "../helpers/utils";
import usePhotos from "../context/photos/hooks/use-photos";

interface PhotosSearchProps {}

export default function PhotosSearch({

}: PhotosSearchProps) {
    const [inputValue, setInputValue] = useState("");
    const { filters } = usePhotos();

    const debouncedSetValue = React.useCallback(
        debounce((value: string) => filters.setQ(value), 200), 
        [filters.setQ]
    );

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { value } = e.target;
        setInputValue(value);
        debouncedSetValue(value);
    }

    return (
        <InputText 
            icon={SearchIcon}
            placeholder="Buscar fotos"
            className="flex-1"
            value={inputValue}
            onChange={handleInputChange}
        />
    )
}