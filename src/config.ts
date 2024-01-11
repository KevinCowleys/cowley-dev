interface ConfigLayout {
    github: {
        title: string,
        href: string,
        iconName: "GitHub" | "LinkedIn"
    },
    linkedin: {
        title: string,
        href: string,
        iconName: "GitHub" | "LinkedIn"
    }
};

export const config: ConfigLayout = {
    github: {
        title: "GitHub",
        href: "https://github.com/KevinCowleys",
        iconName: "GitHub"
    },
    linkedin: {
        title: "LinkedIn",
        href: "https://www.linkedin.com/in/kevincowleys/",
        iconName: "LinkedIn"
    },
}
