import { getLinks } from "@/apis/shorten";
import { Link } from "@/types";
import { createContext, useCallback, useContext, useState } from "react";
import { useCookies } from "react-cookie";

type LinksContextType = {
    shortenedUrls: Link[];
    fetchLinks: () => Promise<void>;
    errorMessage: string;
};

const LinksContext = createContext<LinksContextType | undefined>(undefined);

export const LinksProvider = ({ children }: { children: React.ReactNode }) => {
    const [cookies] = useCookies(["token"]);
    const [shortenedUrls, setShortenedUrls] = useState<Link[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const fetchLinks = useCallback(async () => {
        try {
            const links: Link[] = await getLinks(cookies.token);
            setShortenedUrls(links);
        } catch (error: unknown) {
            console.error("Error fetching links:", error);

            // Ensure the error is properly formatted
            if (error instanceof Error) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("Something went wrong, please reload the page or try again later.");
            }
        }
    }, [cookies.token]);

    // useEffect(() => {
    //     if (cookies.token) {
    //         console.log('fetch in context')
    //         fetchLinks();
    //     }
    // }, [cookies.token]);

    return (
        <LinksContext.Provider value={{ shortenedUrls, fetchLinks, errorMessage }}>
            {children}
        </LinksContext.Provider>
    );
};

export const useLinks = () => {
    const context = useContext(LinksContext);
    if (!context) {
        throw new Error("useLinks must be used within a LinksProvider");
    }
    return context;
};
