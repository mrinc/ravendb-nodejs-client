import { IndexDefinition, IndexDefinitionBuilder } from "./IndexDefinition";
import {
    IndexingGroupResults,
    IndexingMapDefinition,
    IndexingMapUtils,
    IndexingReduceDefinition, StubMapUtils
} from "./StronglyTyped";
import { DocumentType } from "../DocumentAbstractions";
import { AbstractGenericIndexCreationTask } from "./AbstractGenericIndexCreationTask";
import { TypeUtil } from "../../Utility/TypeUtil";
import { throwError } from "../../Exceptions";
import { StringUtil } from "../../Utility/StringUtil";
import { DocumentConventions } from "../Conventions/DocumentConventions";
import { StringBuilder } from "../../Utility/StringBuilder";

export class AbstractJavaScriptMultiMapIndexCreationTask<TMapResult extends object = any>
    extends AbstractGenericIndexCreationTask<keyof TMapResult & string> {

    private _maps: string[] = [];
    private _reduce: string;

    protected constructor() {
        super();

        this.conventions = new DocumentConventions();
    }

    /**
     * Register map
     * @param collectionOrDocumentType Collection name to index over
     * @param definition Index definition that maps to the indexed properties
     */
    public map<TDocument extends object>(
        collectionOrDocumentType: string | DocumentType<TDocument>, definition: IndexingMapDefinition<TDocument, TMapResult>) {

        const collection = TypeUtil.isString(collectionOrDocumentType)
            ? collectionOrDocumentType
            : this.conventions.findCollectionName(collectionOrDocumentType);

        const escapedCollection = new StringBuilder();
        StringUtil.escapeString(escapedCollection, collection);
        this._maps.push(`map(\'${escapedCollection.toString()}\', ${definition})`);
    }

    /**
     * Sets the index definition reduce
     * @param mapReduce Reduce definition
     */
    public reduce(mapReduce: IndexingReduceDefinition<TMapResult>) {
        this._reduce = mapReduce(new IndexingGroupResults<TMapResult>()).format();
    }

    public addSource(name: string, source: Function): void {
        this.additionalSources ??= {};

        const sourceAsString = source.toString();

        if (!sourceAsString.includes("function")) {
            throwError("InvalidOperationException", "Additional sources require named function. Arrow functions are not supported.");
        }

        this.additionalSources[name] = source.toString();
    }

    /**
     * No implementation is required here, the interface is purely meant to expose map helper methods such as `load(id, collection)` etc
     */
    public mapUtils(): IndexingMapUtils {
        return new StubMapUtils();
    }

    public get isMapReduce(): boolean {
        return !!this.reduce;
    }

    public createIndexDefinition(): IndexDefinition {
        const indexDefinitionBuilder = new IndexDefinitionBuilder(this.getIndexName());
        indexDefinitionBuilder.indexesStrings = this.indexesStrings;
        indexDefinitionBuilder.analyzersStrings = this.analyzersStrings;
        indexDefinitionBuilder.reduce = this._reduce;
        indexDefinitionBuilder.storesStrings = this.storesStrings;
        indexDefinitionBuilder.suggestionsOptions = this.indexSuggestions;
        indexDefinitionBuilder.termVectorsStrings = this.termVectorsStrings;
        indexDefinitionBuilder.spatialIndexesStrings = this.spatialOptionsStrings;
        indexDefinitionBuilder.outputReduceToCollection = this.outputReduceToCollection;
        indexDefinitionBuilder.patternForOutputReduceToCollectionReferences = this.patternForOutputReduceToCollectionReferences;
        indexDefinitionBuilder.patternReferencesCollectionName = this.patternReferencesCollectionName;
        indexDefinitionBuilder.additionalSources = this.additionalSources;
        indexDefinitionBuilder.additionalAssemblies = this.additionalAssemblies;
        indexDefinitionBuilder.configuration = this.configuration;
        indexDefinitionBuilder.lockMode = this.lockMode;
        indexDefinitionBuilder.priority = this.priority;
        indexDefinitionBuilder.state = this.state;
        indexDefinitionBuilder.deploymentMode = this.deploymentMode;

        const indexDefinition = indexDefinitionBuilder.toIndexDefinition(this.conventions, false);
        indexDefinition.maps = new Set(this._maps);

        return indexDefinition;
    }
}
