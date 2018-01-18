class Position {
  x: number;
  y: number;
}

class CardFieldProps {
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  textAlign: string;
  textDecoration: string;
}

class CardField {
  id: string;
  caption: string;
  placeholder: string;
  position: Position;
  props: CardFieldProps;
}

export class Card {
  name: string;
  storageKey: string;
  wrapperStyles: {
    background: string,
    borderRadius: string
  };
  fields: CardField[]
}
