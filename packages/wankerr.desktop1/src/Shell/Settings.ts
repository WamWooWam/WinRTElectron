export class Settings {
    get personalisation() : Personalisation {
        return new Personalisation();
    }
}

class Personalisation {
    accentColour: string = "#4abaf8";
}