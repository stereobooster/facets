import { Adapter } from "@/search";
import { useSearch } from "./useSearch";
import { Schema } from "@stereobooster/facets";

export type ResultsProp<S extends Schema> = {
  adapter: Adapter<S>;
};

export default function Results<S extends Schema>({ adapter }: ResultsProp<S>) {
  const results = useSearch(adapter);
  return (
    <ul>
      {results.items.map((x) => (
        <li key={[x.name].join()}>{x.name}</li>
      ))}
    </ul>
  );
}
