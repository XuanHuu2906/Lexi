"""Synthetic Phase 3 contract fixtures, not HTTP captures. No user credentials.

Shapes checked against the named NestJS handlers/DTOs and Prisma schema.
Run from any directory; Swift tests consume the output as a test-only resource.
"""
import copy
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
baseline = json.loads((root / 'docs/contracts/fixtures/baseline.json').read_text(encoding='utf-8'))
cases = baseline['cases']
by_name = {c['name']: c['body']['data'] for c in cases if c['body']['success']}
word = by_name['words_list_with_nullable_fields']['items'][0]
stamp = '2026-10-17T00:00:00.000Z'


def add(name, path, data, source, method='GET', status=200):
    cases.append(dict(name=name, path=path, method=method, status=status, source=source,
                      body=dict(success=True, data=data)))


add('word_created', '/words', word, 'backend/src/words/words.service.ts#create', 'POST', 201)
add('word_deleted', '/words/fixture-word-a', {'deleted': True}, 'backend/src/words/words.service.ts#remove', 'DELETE')
add('review_due', '/review/due', dict(items=[word], count=1, total=1), 'backend/src/review/review.service.ts#due')
for mode in ['guess', 'listen', 'fill', 'match']:
    card = dict(wordId=word['id'], term=word['term'], meaning=word['meaning'], phonetic=None, examples=[])
    if mode in ['guess', 'listen']:
        card.update(options=['quả táo', 'sách', 'ghế', 'bàn'], answerIndex=0)
    if mode == 'fill':
        card['cloze'] = None
    cards = [card]
    if mode == 'match':
        cards = [dict(card, wordId=f'fixture-word-{i}', term=term, meaning=meaning)
                 for i, (term, meaning) in enumerate(zip(['apple', 'book', 'chair', 'table'], ['quả táo', 'sách', 'ghế', 'bàn']))]
    add('flashcard_' + mode, '/review/flashcards', dict(mode=mode, scope='due', count=len(cards), cards=cards),
        'backend/src/review/review.service.ts#flashcards')

questions = copy.deepcopy(by_name['quiz_in_progress']['questions'])
for q in questions:
    q.pop('userAnswer')
add('quiz_generated', '/quiz/generate', dict(quizId='fixture-quiz-a', total=4, questions=questions),
    'backend/src/review/quiz.service.ts#generate', 'POST', 201)
completed = copy.deepcopy(by_name['quiz_in_progress'])
completed.update(score=4, status='COMPLETED')
for q in completed['questions']:
    q.update(userAnswer=q['index'], answerIndex=q['index'], explanation='Fixture explanation')
add('quiz_completed', '/quiz/fixture-quiz-a', completed, 'backend/src/review/quiz.service.ts#get')
add('quiz_submitted', '/quiz/submit', dict(quizId='fixture-quiz-a', score=4, total=4, results=[
    dict(index=i, correct=True, yourAnswer=i, answerIndex=i, explanation='Fixture explanation') for i in range(4)]),
    'backend/src/review/quiz.service.ts#submit', 'POST', 201)
add('quiz_saved', '/quiz/fixture-quiz-a/progress', dict(saved=True),
    'backend/src/review/quiz.service.ts#saveProgress', 'PATCH')

settings = dict(dailyGoal=20, cefrLevel='B1', topics=[], reminderTime='20:00', timeZone='Asia/Ho_Chi_Minh',
                notifyEnabled=False, ttsVoice='EN_US')
add('settings_updated', '/users/me/settings', settings, 'backend/src/users/users.service.ts#updateSettings', 'PATCH')
streak = dict(currentStreak=2, longestStreak=3, streakFreezes=1, lastActiveDate=stamp)
user = copy.deepcopy(by_name['user_nullable_relations'])
user.update(setting=settings, streak=streak)
add('user_with_relations', '/users/me', user, 'backend/src/users/users.service.ts#getProfile')
add('streak', '/streak', dict(**streak, today=dict(wordsReviewed=4, dailyGoal=20, goalMet=False)),
    'backend/src/progress/gamification.service.ts#getStreak')
add('stats', '/stats/overview', dict(period='all', totalWords=3, mastered=1, learning=1, new=1,
    retentionRate=75, reviewsCount=4, activeDays=2, quizzes=dict(count=1, avgScorePercent=75)),
    'backend/src/progress/stats.service.ts#overview')
add('weakness', '/stats/weakness', dict(weakTopics=[dict(topic='food', reviews=4, accuracy=75)],
    weakWords=[dict(term='apple', meaning='quả táo', fails=1)]), 'backend/src/progress/stats.service.ts#weakness')
add('badges', '/badges', dict(newlyEarned=[], badges=[dict(code='fixture', name='Fixture', description='Synthetic',
    icon=None, earned=False, earnedAt=None)]), 'backend/src/progress/gamification.service.ts#getBadges')
add('tutor', '/tutor/ask', dict(answer='Example answer', words=[dict(term='apple', meaning='quả táo')],
    grammar=[dict(title='Articles', rule='Use an before a vowel sound.')]), 'backend/src/ai/features/tutor.ts', 'POST', 201)
add('writing', '/writing/grade', dict(correctedText='I am learning.', issues=[dict(original='I is', correction='I am',
    explanation='Subject agreement', type='grammar')], overallComment='Practice', score=8.5),
    'backend/src/ai/features/writing.ts', 'POST', 201)
add('grammar_qa', '/grammar-qa/ask', dict(answer='Example explanation'), 'backend/src/skills/grammar-qa.controller.ts', 'POST', 201)
add('pronunciation', '/pronunciation/score', dict(score=85.5, transcriptHeard='apple', mispronounced=[], feedback='Practice'),
    'backend/src/ai/features/pronunciation.ts', 'POST', 201)
lookup = dict(term='apple', partOfSpeech='noun', phonetic='', meaning='quả táo', meaningEn='A fruit',
              examples=[dict(en='An apple.', vi='Một quả táo.')], synonyms=[], antonyms=[], contextNote='')
add('lookup', '/words/lookup', lookup, 'backend/src/ai/features/dictionary.ts', 'POST', 201)
add('lookup_batch', '/words/lookup-batch', dict(items=[dict(term='apple', result=lookup), dict(term='unknown', error='Failed')]),
    'backend/src/words/words.service.ts#lookupBatch', 'POST', 201)
verify = dict(lookup)
verify.pop('term')
add('verify', '/words/verify', dict(**verify, isValid=True, correctedTerm='apple', meaningVerdict='match'),
    'backend/src/ai/features/vocab-verify.ts', 'POST', 201)
add('quick_add', '/words/quick-add', dict(word=word, isToeicTerm=True,
    synonyms=[dict(word='fruit', meaning='trái cây', isToeic=True)]), 'backend/src/words/words.service.ts#quickAdd', 'POST', 201)
add('examples', '/words/fixture-word-a/examples', dict(generated=lookup['examples'], word=word),
    'backend/src/words/words.service.ts#generateExamples', 'POST', 201)
for status in [400, 404, 409, 422, 503]:
    cases.append(dict(name=f'error_{status}', path='/words', method='GET', status=status,
        source='backend/src/common/filters/all-exceptions.filter.ts; 422 transport compatibility only',
        body=dict(success=False, statusCode=status, message=['term must be a string'] if status in [400, 422] else 'Fixture error',
                  error='FixtureError', path='/words', timestamp=stamp)))
native_user = dict(by_name['user_nullable_relations'])
native_user.pop('setting')
native_user.pop('streak')
tokens = dict(accessToken='fixture-access-not-a-jwt', refreshToken='0' * 64, accessExpiresIn=900)
for action, status in [('login', 200), ('register', 201)]:
    add('mobile_' + action, '/auth/mobile/' + action, dict(user=native_user, **tokens),
        'backend/src/auth/mobile-auth.controller.ts + auth.service.ts; synthetic, not staging capture', 'POST', status)
add('mobile_refresh', '/auth/mobile/refresh', tokens,
    'backend/src/auth/mobile-auth.controller.ts; synthetic, not staging capture', 'POST')
add('mobile_logout', '/auth/mobile/logout', dict(message='Logged out'),
    'backend/src/auth/mobile-auth.controller.ts; synthetic, not staging capture', 'POST')
target = root / 'Tests/LexiIOSTests/Fixtures/contracts.json'
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(json.dumps(dict(provenance='Synthetic source-based fixtures; not live captures. Regenerate with scripts/generate-contract-fixtures.py.',
                                 cases=cases), ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'Generated {len(cases)} synthetic contract cases.')
