import InputText from "./input-text";
import SearchIcon from "../assets/icons/search.svg?react";
import React, { useState } from "react";
import { debounce } from "../helpers/utils";

interface PhotosSearchProps {}

export default function PhotosSearch({

}: PhotosSearchProps) {
    const [inputValue, setInputValue] = useState("");

    const debouncedSetValue = React.useCallback(
        debounce((value: string) => console.log({value}), 200), 
        []
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