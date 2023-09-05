import sys, json, random

industry = sys.argv[1]
description = sys.argv[2]
lacomp = float(sys.argv[3])
mfcomp = float(sys.argv[4])
vmcomp = float(sys.argv[5])


def manual_pipeline(att_dict, obj_industry, desc, jdata):
    idx = random.randint(0, len(jdata)-1)
    info = jdata[idx]['Color']+'+'+jdata[idx]['pimg'][0]+'+'+jdata[idx]['hex']+'+'+jdata[idx]['Description']
    return info


def att_diff(att_dict, jdata):
    # returns list of color market vector closeness

    att_dict = np.array(att_dict)
    att_dict = att_dict.astype('float64')
    score_list = [10] * len(jdata)
    for i in range(len(jdata)):
        for y in jdata[i]['AV_dict']:
            color_avd = np.array(list(y.values()))
            color_avd = color_avd.astype('float64')
            score = sum(color_avd - att_dict)
            if score < score_list[i]: score_list[i] = score

    return np.array(score_list)


def industry_contains(obj_industry, jdata):
    obj_industry = obj_industry.lower()
    flag_list = [0] * len(jdata)

    for x in range(len(jdata)):
        for y in jdata[x]['Industry']:
            if y.lower() in obj_industry:
                flag_list[x] = 1
                break

    return np.array(flag_list)


def dsi_calc(desc, jdata):
    # naive DSI calculator (mvp)

    flag_list = [0] * len(jdata)
    for x in range(len(jdata)):
        for y in jdata[x]['Representation']:
            if y.lower() in desc:
                flag_list[x] = 1
                break

    return np.array(flag_list)

def main():
    global industry, description, lacomp, mfcomp, vmcomp

    with open('./public/color-maps/Pallete.json') as f:
        data = json.load(f)

    # DataPrep
    AV_dict = {'masculine': mfcomp, 'affordable': lacomp, 'modern': vmcomp}

    try:
        man_decision = manual_pipeline(AV_dict, industry, description, data)
        print(man_decision)
    except Exception as e:
        print(e)
    sys.stdout.flush()


# start process
if __name__ == '__main__':
    main()
