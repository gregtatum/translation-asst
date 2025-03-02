import { Thunk } from 'src/@types';
import * as Plain from './plain';
import { $, T, Utils } from 'src';
import { ensureExists } from 'src/utils';

/**
 * This file contains all of the thunk actions, that contain extra logic,
 * such as conditional dispatches, and multiple async calls.
 */

/**
 * These should only be used internally in thunks.
 */
const PlainInternal = {
  example() {
    return { type: 'example' as const };
  },
  addTranslation(translation: T.Translation, slug: string) {
    return { type: 'add-translation' as const, translation, slug };
  },
  undoLearnStem(stem: string, languageCode: string) {
    return { type: 'undo-learn-stem' as const, stem, languageCode };
  },
  undoIgnoreStem(stem: string, languageCode: string) {
    return { type: 'undo-ignore-stem' as const, stem, languageCode };
  },
  nextSentence(stem: T.Stem, direction: -1 | 1) {
    return {
      type: 'next-sentence' as const,
      direction,
      stem,
    };
  },
};

export type PlainInternal = typeof PlainInternal;

export function exampleThunk(): Thunk {
  return (dispatch, getState) => {
    console.log(getState());
    dispatch(PlainInternal.example());
    dispatch(Plain.setOpenAIApiKey('example'));
  };
}

export function addTranslation(
  summary: string,
  navigate?: (path: string) => void,
): Thunk<{ slug: string; translation: T.Translation }> {
  return (dispatch, getState) => {
    const { sourceLanguage, targetLanguage } = $.guessTranslationLanguages(
      getState(),
    );

    const slugs = $.getSlugs(getState());
    const slug = Utils.getUniqueSlug(slugs, Utils.sluggify(summary));
    const translation: T.Translation = {
      sourceText: '',
      sourceLanguage,
      targetLanguage,
      summary,
      sourceSentences: [],
      targetSentences: [],
    };

    dispatch(PlainInternal.addTranslation(translation, slug));
    if (navigate) {
      navigate('/translation/' + slug);
    }
    return { slug, translation };
  };
}

export function selectNextStem(direction: -1 | 1): Thunk<number> {
  return (dispatch, getState) => {
    const stems = $.getUnknownStems(getState());
    if (!stems) {
      throw new Error('Expected stems when selecting a new stem');
    }
    let stemIndex = $.getSelectedStemIndex(getState()) ?? -1;
    stemIndex += direction;
    // Keep the index in bounds.
    stemIndex = Math.max(0, Math.min(stemIndex, stems.length - 1));
    dispatch(Plain.selectStem(stemIndex));
    return stemIndex;
  };
}

export function ignoreSelectedStem(): Thunk {
  return (dispatch, getState) => {
    const stem = $.getSelectedStem(getState());
    const languageCode = $.getLanguageCode(getState());
    if (stem) {
      dispatch(Plain.ignoreStem(stem.stem, languageCode));
    }
  };
}

export function learnSelectedStem(): Thunk {
  return (dispatch, getState) => {
    const stem = $.getSelectedStem(getState());
    const languageCode = $.getLanguageCode(getState());
    if (stem) {
      dispatch(Plain.learnStem(stem.stem, languageCode));
    }
  };
}

export function applyUndo(): Thunk {
  return (dispatch, getState) => {
    const undoList = $.getUndoList(getState());
    const action = undoList[undoList.length - 1];
    if (!action) {
      return;
    }
    switch (action.type) {
      case 'learn-stem':
        dispatch(PlainInternal.undoLearnStem(action.stem, action.languageCode));
        break;
      case 'ignore-stem':
        dispatch(
          PlainInternal.undoIgnoreStem(action.stem, action.languageCode),
        );
        break;
      default:
        throw new Error('Unknown undo action: ' + action.type);
    }
  };
}

export function nextSentence(direction: -1 | 1, stemIndex?: number): Thunk {
  return (dispatch, getState) => {
    if (stemIndex === undefined) {
      stemIndex = ensureExists($.getSelectedStemIndex(getState()));
    }
    const stem = ensureExists($.getUnknownStems(getState()))[stemIndex];

    dispatch(PlainInternal.nextSentence(stem, direction));
  };
}
