'use client';

import React from 'react';
import { AddressSuggestions } from 'react-dadata';
import 'react-dadata/dist/react-dadata.css';

interface Props {
  onChange?: (value?: string) => void;
}

export const AdressInput: React.FC<Props> = ({ onChange }) => {
  return (
    <AddressSuggestions
      token="d5a2b924374a732760ce3432defc9675525c4afc"
      onChange={(data) => onChange?.(data?.value)}
    />
  );
};
